import { PlayerView } from "../../../models/enums/player-view..enum";
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import {
  Axis,
  D3,
  D3Service,
  ScaleBand,
  ScaleLinear,
} from "@muni-kypo-crp/d3-service";
import { DataEntry } from "../../../models/data-entry";
import { TrainingConfig } from "../../../models/training-config";
import { PlanConfig } from "../../../models/plan-config";
import { BaseConfig } from "../../../models/base-config";
import { TrainingData } from "../../../models/training-data";
import { PlanData } from "../../../models/plan-data";
import { Event } from "../../..//models/event";
import { Padding } from "../../../models/padding";
import { AppConfig } from "../../../../app.config";
import { View } from "../../../models/view.enum";
import { GenericObject } from "../../../models/generic-object.type";
import { NumericObject } from "../../../models/numeric-object.type";
import { SortingService } from "../../../services/sorting.service";
import { FilteringService } from "../../../services/filtering.service";
import { PreparedData } from "../../../models/preparedData";
import { DisplayView } from "../../../models/view";
import { TrainingAnalysisEventService } from "../../../models/training-analysis-event-service";
import { ConfigService } from "../../../config/config.service";
import { Subscription } from "rxjs";
import { VisualizationData } from "../../../models/visualization-data";
import { Level } from "../../../models/level";
import { LevelTypeEnum } from "../../../enums/level-type.enum";
import { PlanDataEntry } from "../../../models/plan-data-entry";
import { TrainingDataEntry } from "../../../models/training-data-entry";
import { PlayerLevel } from "../../../models/player-level";
import { HintTakenEvent } from "../../../models/hint-taken-event";
import { Player } from "../../../models/player";
import { WrongAnswerEvent } from "../../../models/wrong-answer-event";
import { TrainingRunEndedEvent } from "../../../models/training-run-ended-event";

@Component({
  selector: "kypo-viz-hurdling",
  templateUrl: "./training-analysis.component.html",
  styleUrls: ["./training-analysis.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class TrainingAnalysisComponent
  implements OnChanges, OnDestroy, AfterViewInit
{
  @Input() visualizationData: VisualizationData;

  @Input() view = this.appConfig.defaultView;
  @Input() selectedPlayerView: PlayerView = PlayerView.Both;

  @Input() colorScheme: string[];
  @Input() eventService: TrainingAnalysisEventService;
  @Input() setDashboardView = false;
  @Input() externalFilters;
  @Input() trainingColors = this.appConfig.trainingColors;
  @Input() playerColorScheme: string[];
  @Input() trainingInstanceId: number;

  @Input() selectedPlayers: Player[];
  @Output() outputSelectedPlayers = new EventEmitter<number[]>();
  @Output() highlightedPlayer = new EventEmitter<number>();

  private wrapperWidth: number;
  private wrapperHeight: number;
  private width: number;
  private height: number;
  private padding: Padding;
  private bounds: any;
  private outerWrapper: any;

  private readonly d3: D3;
  private chart: any;
  private plan: any;
  private planDomain: number;
  private trainingDomain: number;
  private fullTime: number;
  private trainingChartWrapper: any;
  private trainingChart: any;
  public xScale: ScaleLinear<number, number>;
  private yScale: ScaleBand<string>;
  private xAxis: Axis<number | { valueOf(): number }>;
  private planSegments: any;
  private boundSegments: any;
  private tooltip: any;
  private timeline: any;
  private trainingDataSet: TrainingDataEntry[] = [];
  private planDataSet: GenericObject[] = [];
  private levels: Level[];
  private levelKeys: string[] = [];
  private levelsTimePlan: number[];
  private _activeDataSubscribtion;
  private _updateVisSubscribtion;
  private currentTime;
  private filterSubscription: Subscription;
  private highlightSubscription: Subscription;
  private levelSorted: Level;
  private selectedTrainees: number[] = [];

  // zooming
  private panValue = 0;
  private overviewZoomValue = 1;
  private progressZoomValue = 1;
  private zoomValue = 1;

  private dataColumns = {
    team: "ctf-progress-teamcolumn",
    time: "ctf-progress-timecolumn",
    score: "ctf-progress-scorecolumn",
    hints: "ctf-progress-hintscolumn",
    answers: "ctf-progress-answerscolumn",
    compare: "ctf-progress-comparecolumn",
  };
  private trainingData: TrainingData;
  private planData: PlanData;

  public time = 0;
  public startTime = 0;
  public participants;
  public filterStatus = "";
  public sortType = "name";
  public sortReverse = false;
  public sortLevel = 0;
  public levelSortOptions: GenericObject[] = [];
  public viewOptions: DisplayView[] = this.appConfig.viewOptions;
  public filterOptions: DisplayView[] = this.appConfig.filterOptions;
  public selectedFilterValue = 1;
  public columns: string[] = ["time", "score", "hints", "answers"];

  public hasData;
  public errorMessage: string = null;
  public runsToCompare: Array<{ id: string; avatar: string }> = [];
  public filteredPlayers: Player[];
  public playerDetailId: number;

  constructor(
    d3Service: D3Service,
    private sortingService: SortingService,
    private filteringService: FilteringService,
    private configService: ConfigService,
    private appConfig: AppConfig
  ) {
    this.d3 = d3Service.getD3();
  }

  ngOnChanges(): void {
    this.configService.trainingColors = this.trainingColors;
    this.setData();
  }

  checkIfActive(player: Player): boolean {
    return this.visualizationData.playerProgress.find(
      (playerProgress) => playerProgress.userRefId == player.userRefId
    )
      ? true
      : false;
  }

  ngAfterViewInit(): void {
    this.setData();
    this.setFilterStatus();
    this.initializeZoom();
  }

  setData() {
    this.startTime = this.getFirstEventTimestamp();
    this.time = this.getTime();
    this.currentTime = this.time;
    this.levels = this.visualizationData.levels;
    this.trainingDataSet = this.populateTrainingDataset();
    this.levelsTimePlan = this.getLevelsTimePlan();
    this.levelKeys = this.getLevelKeys();
    this.planDataSet = this.getUpdatedPlanDataSet(this.trainingDataSet);
    this.participants = this.visualizationData.players;
    this.drawChart();
  }

  getTime(): number {
    const allFinished =
      this.visualizationData.playerProgress
        .map((playerProgress) => playerProgress.levels)
        .reduce((accumulator, value) => accumulator.concat(value), [])
        .map((levels) => levels.events)
        .reduce((accumulator, value) => accumulator.concat(value), [])
        .filter((event) => event instanceof TrainingRunEndedEvent).length ==
      this.visualizationData.playerProgress.length;

    if (allFinished) {
      return this.getLatestEventTimestamp() - this.startTime;
    } else {
      return this.visualizationData.currentTime - this.startTime;
    }
  }

  getLatestEventTimestamp(): number {
    return this.visualizationData.playerProgress
      .map((playerProgress) => playerProgress.levels)
      .reduce((accumulator, value) => accumulator.concat(value), [])
      .map((levels) => levels.events)
      .reduce((accumulator, value) => accumulator.concat(value), [])
      .map((event) => event.timestamp)
      .sort()
      .pop();
  }

  getFirstEventTimestamp(): number {
    return this.visualizationData.playerProgress
      .map((playerProgress) => playerProgress.levels)
      .reduce((accumulator, value) => accumulator.concat(value), [])
      .map((levels) => levels.events)
      .reduce((accumulator, value) => accumulator.concat(value), [])
      .map((event) => event.timestamp)
      .sort((a, b) => b - a)
      .pop();
  }

  populateTrainingDataset(): TrainingDataEntry[] {
    const trainingDataSet = [];
    this.visualizationData.playerProgress.forEach((playerProgress) => {
      const trainingDataEntry = new TrainingDataEntry();
      trainingDataEntry.trainingRunId = playerProgress.trainingRunId;
      trainingDataEntry.playerId = playerProgress.userRefId;
      trainingDataEntry.playerName = this.getPlayerData(
        playerProgress.userRefId
      ).name;
      trainingDataEntry.playerAvatar = this.getPlayerData(
        playerProgress.userRefId
      ).picture;
      trainingDataEntry.teamIndex = this.getPlayerData(
        playerProgress.userRefId
      ).teamIndex;
      trainingDataEntry.hints = this.getHintsForPlayer(
        playerProgress.userRefId
      );
      trainingDataEntry.score = this.getScoreForPlayer(
        playerProgress.userRefId
      );
      trainingDataEntry.answers = this.getAnswersForPlayer(
        playerProgress.userRefId
      );
      trainingDataEntry.events = this.getEventsForPlayer(
        playerProgress.userRefId
      );
      trainingDataEntry.totalTime = this.getTotalTime(playerProgress.userRefId);
      trainingDataEntry.currentState = this.getStateForPlayer(
        playerProgress.userRefId
      );
      trainingDataEntry["start"] =
        this.getFirstLevelTimestamp(playerProgress.userRefId) - this.startTime;
      playerProgress.levels.forEach((level, index = 1) => {
        if (level.state == "FINISHED") {
          trainingDataEntry["level" + (index + 1)] =
            level.endTime - level.startTime;
        }
      });
      trainingDataSet.push(trainingDataEntry);
    });
    return trainingDataSet;
  }

  getFirstLevelTimestamp(playerId: number): number {
    return this.getPlayerLevels(playerId).values().next().value.startTime;
  }

  getScoreForPlayer(playerId: number): number {
    return this.getPlayerLevels(playerId)
      .map((level) => level.score)
      .reduce((a, b) => a + b);
  }

  getStateForPlayer(playerId: number): string {
    const levelsFinishedCount = this.getPlayerLevels(playerId).filter(
      (playerLevel) => playerLevel.state == "FINISHED"
    ).length;
    return levelsFinishedCount == this.levels.length
      ? "FINISHED"
      : "level" + (levelsFinishedCount + 1);
  }

  getTotalTime(playerId: number): number {
    const playerStartTime =
      this.getFirstLevelTimestamp(playerId) - this.startTime;
    if (this.getStateForPlayer(playerId) == "FINISHED") {
      const playerLevels = this.getPlayerLevels(playerId);
      return (
        playerLevels[playerLevels.length - 1].events.slice(-1)[0].trainingTime -
        playerStartTime +
        this.trainingDataSet.find((player) => player.playerId == playerId)
          ?.start
      );
    }
    return this.currentTime - playerStartTime;
  }

  getHintsForPlayer(playerId: number) {
    return this.getPlayerLevels(playerId)
      .map((level) => level.hintsTaken)
      .filter((hint) => hint != null)
      .reduce((a, b) => a.concat(b), []).length;
  }

  getAnswersForPlayer(playerId: number) {
    return this.getPlayerLevels(playerId)
      .map((level) => level.wrongAnswers_number)
      .filter((wrongAnswerNumber) => wrongAnswerNumber != null)
      .reduce((a, b) => a + b, 0);
  }

  getEventsForPlayer(playerId: number): Event[] {
    return this.getPlayerLevels(playerId)
      .map((level) => level.events)
      .reduce((a, b) => a.concat(b), [])
      .map((event) => {
        (event.levelNumber = this.getLevelNumber(event.levelId)),
          (event.playerName = this.getPlayerData(playerId).name);
        event.playerId = playerId;
        return event;
      });
  }

  getLevelNumber(levelId: number) {
    return this.levels.find((level) => level.id === levelId).order + 1;
  }

  getPlayerLevels(playerId: number): PlayerLevel[] {
    return this.visualizationData.playerProgress.find(
      (player) => player.userRefId == playerId
    ).levels;
  }

  getPlayerData(playerId: number) {
    return this.visualizationData.players.find(
      (player) => player.userRefId == playerId
    );
  }

  getLevelsTimePlan() {
    return this.visualizationData.levels.map((level: Level) =>
      level.estimatedDuration > 0 ? level.estimatedDuration * 60 : 60
    );
  }

  private getLevelKeys(): string[] {
    let levelKeys = this.levels.map((level) => "level" + (level.order + 1));
    // in progress view we want to also see start time offset
    if (this.view === View.Progress) levelKeys = ["start"].concat(levelKeys);
    return levelKeys;
  }

  setFilteredPlayers(players: Player[]) {
    this.filteredPlayers = players;
    this.drawChart();
  }

  drawChart(): void {
    const data: PreparedData = this.getPreparedData();
    this.applyData(data.trainingDataSet, data.planDataSet);
    this.pan();
  }

  initializeZoom(): void {
    if (this.view === View.Overview) {
      // in the case of overview mode, we initially want to see only the player progress, not the whole training plan
      this.overviewZoomValue =
        this.view === View.Overview
          ? Math.max(
              // but we don't want the zooming to be extreme
              Math.min(
                this.appConfig.maxZoomValue,
                this.xScale(this.planDomain) / this.xScale(this.time)
              ),
              1
            )
          : this.zoomValue;
      this.zoomValue = this.overviewZoomValue;
    } else if (this.view === View.Progress) {
      this.zoomValue = this.progressZoomValue;
    }
  }

  getPreparedData(): PreparedData {
    const filteredTrainingDataSet = this.filteringService.filter(
      this.trainingDataSet,
      this.selectedFilterValue
    );

    let sortedTrainingDataSet = this.sortingService.sort(
      filteredTrainingDataSet,
      this.sortReverse,
      this.sortType,
      this.sortLevel,
      this.view,
      this.levels
    );
    let sortedPlanDataSet = this.getUpdatedPlanDataSet(sortedTrainingDataSet);

    // filter players from player selection component
    if (this.selectedPlayers) {
      sortedTrainingDataSet = sortedTrainingDataSet.filter((data) =>
        this.selectedPlayers.find(
          (player) => player.userRefId === data.playerId
        )
      );
      sortedPlanDataSet = sortedPlanDataSet.filter((data) =>
        this.selectedPlayers.find(
          (player) => player.userRefId === data.playerId
        )
      );
    } else if (!this.selectedPlayers && this.filteredPlayers) {
      sortedTrainingDataSet = sortedTrainingDataSet.filter(
        (dataRow) =>
          this.filteredPlayers.find(
            (player) => player.name === dataRow.playerName
          ) !== undefined
      );
      sortedPlanDataSet = sortedPlanDataSet.filter(
        (dataRow) =>
          this.filteredPlayers.find(
            (player) => player.name === dataRow.playerName
          ) !== undefined
      );
    }
    return {
      trainingDataSet: sortedTrainingDataSet,
      planDataSet: sortedPlanDataSet,
    };
  }

  getUpdatedPlanDataSet(trainingDataSet: GenericObject[]): PlanDataEntry[] {
    const planDataset: PlanDataEntry[] = [];

    trainingDataSet.forEach((d: TrainingDataEntry) => {
      const planDataEntry = new PlanDataEntry();
      planDataEntry.playerName = d.playerName;
      planDataEntry.playerId = d.playerId;
      planDataEntry["start"] = 0;
      this.levels.forEach((level, index) => {
        const timePlan: number = this.levelsTimePlan[index];
        planDataEntry["level" + (level.order + 1)] = timePlan;
      });
      planDataset.push(planDataEntry);
    });
    return planDataset;
  }

  applyData(
    trainingDataSet: GenericObject[],
    planDataSet: GenericObject[]
  ): void {
    if (trainingDataSet.length === 0 || planDataSet.length === 0) {
      this.hasData = false;
      this.clear();
      return;
    }

    this.hasData = true;

    this.trainingData = {
      time: this.time,
      levels: this.levels,
      keys: this.levelKeys,
      teams: trainingDataSet,
    };

    this.planData = {
      keys: this.levelKeys,
      teams: planDataSet,
    };

    this.levelSortOptions = [];

    const estimatedTime = this.getEstimatedTime();
    this.fullTime = this.trainingData.time;
    this.drawChartBase({
      data: this.planData,
      element: "ctf-progress-chart",
      outerWrapperElement: "ctf-progress-wrapper",
      time: 0,
      padding: {
        top: 10,
        bottom: 40,
      },
      minBarHeight: this.appConfig.minBarHeight,
      maxBarHeight: this.appConfig.maxBarHeight,
      estimatedTime: estimatedTime,
    });

    this.drawPlan({
      data: this.planData,
      time: 0,
      estimatedTime: estimatedTime,
    });

    this.drawTraining({
      data: this.trainingData,
      eventShapePaths: this.appConfig.eventShapePaths,
      currentLevelColor: this.appConfig.darkColor,
      time: this.trainingData.time,
    });

    this.addDataColumns();
  }

  getEstimatedTime(): number {
    const levelsTimePlanSum = this.levelsTimePlan.reduce((a, b) => a + b, 0);
    return this.view === View.Progress
      ? this.getLongestEstimate()
      : levelsTimePlanSum;
  }

  getLongestEstimate(): number {
    let longestEstimate = 0;
    let elapsedTime =
      this.visualizationData.currentTime - this.visualizationData.startTime;
    this.visualizationData.playerProgress.forEach((playerProgress) => {
      let remainingTime = playerProgress.levels
        .map((playerLevel, i) => {
          return playerLevel.state != "FINISHED"
            ? this.visualizationData.levels[i].estimatedDuration * 60
            : 0;
        })
        .reduce((a, b) => a + b, 0);
      const estimate = elapsedTime + remainingTime;
      if (longestEstimate < estimate) {
        longestEstimate = estimate;
      }
    });
    return longestEstimate;
  }

  drawChartBase(baseConfig: BaseConfig): void {
    const d3: D3 = this.d3,
      element: string = baseConfig.element,
      planData: PlanData = baseConfig.data,
      padding: Padding = baseConfig.padding,
      estimatedTime: number = baseConfig.estimatedTime,
      stack = d3.stack().keys(planData.keys).offset(d3.stackOffsetNone),
      layers = stack(planData.teams);
    this.time = baseConfig.time;
    this.padding = padding;

    // clear wrapper content
    d3.select("#" + element).html("");
    this.outerWrapper = d3.select("." + baseConfig.outerWrapperElement);
    // create svg
    // calculate the height first, width can change when the scrollbar is added
    this.wrapperWidth = Math.max(
      document.getElementById(element)?.getBoundingClientRect().width, // original (standalone) size
      window.innerWidth - window.innerWidth * 0.37
    ); // get width in the dashboard as a 75% piece of a halfpage
    const maxHeight: number = Math.min(
      this.wrapperWidth * 0.7,
      window.innerHeight - 130,
      baseConfig.maxBarHeight * planData.teams.length
    );
    const minHeight: number =
      baseConfig.minBarHeight * planData.teams.length + 80;
    this.wrapperHeight = Math.max(maxHeight, minHeight);

    this.chart = d3
      .select("#" + element)
      .append("svg")
      .attr("class", "ctf-progress-chart")
      .attr("height", this.wrapperHeight)
      .attr("width", this.wrapperWidth)
      .attr("transform", "translate(0, " + padding.top + ")");

    this.width = this.wrapperWidth * this.zoomValue;
    this.height = this.wrapperHeight - padding.top - padding.bottom;

    this.planDomain = Math.max(
      estimatedTime,
      d3.max(layers[layers.length - 1], (d: number[]): number => {
        return d[1];
      })
    );

    this.initializeScales(planData);
    this.createAxis(estimatedTime, baseConfig.time);
  }

  initializeScales(planData) {
    // init x and y scales
    let yScalePadding: number;
    if (this.wrapperHeight > 550) yScalePadding = 0.02;
    else yScalePadding = 0.05;

    const yDomain = planData.teams.map(
      (d: GenericObject): string => d.playerName
    );

    const paddingOffset =
      this.view === View.Overview ? this.appConfig.finalViewBarPadding : 0;
    this.xScale = this.d3
      .scaleLinear()
      .rangeRound([0, this.width - paddingOffset]);
    this.xScale.domain([0, this.planDomain]);
    this.yScale = this.d3
      .scaleBand()
      .rangeRound([this.height, 0])
      .padding(yScalePadding);
    this.yScale.domain(yDomain);
  }

  createAxis(estimatedTime, time) {
    this.xAxis = this.d3
      .axisBottom(this.xScale)
      .tickFormat((d) => this.getXAxisTickFormat(d))
      .tickSize(5)
      .tickValues(this.d3.range(0, estimatedTime, this.getXAxisTickInterval()));

    this.trainingChartWrapper = this.chart
      .append("g")
      .attr(
        "class",
        this.view === View.Overview
          ? "ctf-training-overview"
          : "ctf-training-progress"
      );
    this.trainingChart = this.trainingChartWrapper
      .append("g")
      .attr("class", "ctf-training");

    // append x axis
    this.trainingChart
      .append("g")
      .attr("class", "axis axis-x")
      .attr("transform", "translate(0," + (this.height + 10) + ")")
      .call(this.xAxis);

    this.trainingChart
      .append("text")
      .attr(
        "transform",
        "translate(" +
          (this.wrapperWidth / 2) * this.zoomValue +
          ", " +
          this.wrapperHeight +
          ")"
      )
      .style("text-anchor", "middle")
      .text("Time");
  }

  getXAxisTickFormat(data: any): string {
    return this.wrapperWidth > 650
      ? this.getTimeString(data)
      : this.getTimeString(data).substring(0, 5);
  }

  getXAxisTickInterval(): number {
    let interval: number =
      this.wrapperWidth < 500
        ? 1800
        : this.xScale(this.fullTime) < 1000
        ? 300
        : 900;
    if (this.wrapperWidth > 500 && this.wrapperWidth < 1200) {
      interval = 600;
    }
    return Math.floor(interval / Math.floor(this.zoomValue));
  }

  drawPlan(planConfig: PlanConfig): void {
    const d3: D3 = this.d3,
      planData: PlanData = planConfig.data,
      stack = d3.stack().keys(planData.keys).offset(d3.stackOffsetNone),
      layers = stack(planData.teams);
    this.plan = this.trainingChart.append("g").attr("class", "plan");

    this.createPattern(planData);
    this.createStatePatterns();
    const planLayers = this.createPlanLayersAndReturnThem(layers);
    this.createPlanSegments(planLayers);
    this.createBoundingLines(layers);
  }

  createPattern(planData) {
    const defs = this.plan.append("defs");
    const pattern = defs
      .selectAll("pattern")
      .data(planData.keys)
      .enter()
      .append("pattern")
      .attr("id", (d: GenericObject, i: string): string => "diagonalHatch" + i)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", "7")
      .attr("height", "4")
      .attr("patternTransform", "rotate(45)");
    pattern
      .append("rect")
      .attr("width", "3")
      .attr("height", "4")
      .attr("transform", "translate(0,0)")
      .attr("fill", (r: GenericObject, i: string): string =>
        this.getPlanColor(+i)
      )
      .style("opacity", "0.5");
  }

  createPlanLayersAndReturnThem(layers) {
    return this.plan
      .selectAll(".plan-layer")
      .data(layers)
      .enter()
      .append("g")
      .attr("class", "plan-layer")
      .style(
        "fill",
        (d: GenericObject, i: string): string => "url(#diagonalHatch" + i + ")"
      );
  }

  createPlanSegments(planLayers) {
    // draw segment (row in column) for each team
    const displayedParticipants = this.filteredPlayers
      ? this.filteredPlayers.length
      : this.participants.length;

    let index = -1;
    this.planSegments = planLayers
      .selectAll(".plan-segment")
      .data((d: GenericObject): GenericObject => d)
      .enter()
      .append("rect")
      .style("fill", (d: GenericObject): string => {
        return (
          "url(#diagonalHatch-" +
          this.getSegmentColor(
            d.data.playerName,
            Math.floor(++index / displayedParticipants)
          ) +
          ")"
        );
      })
      .attr("y", (d: GenericObject): number =>
        this.yScale(String(d.data.playerName))
      )
      .attr("x", (d: GenericObject): number => this.xScale(d[0]))
      .attr("height", this.yScale.bandwidth())
      .attr(
        "width",
        (d: GenericObject): number => this.xScale(d[1]) - this.xScale(d[0])
      );
  }

  getSegmentColor(team: string, levelIndex: number): string {
    const teamData = this.trainingDataSet.find(
      (data) => data.playerName === team
    );
    const estimatedTimeForLevel = this.levelsTimePlan[levelIndex - 1];
    let previousLevelTime = 0;
    for (let i = 1; i <= levelIndex; i++) {
      if (teamData["level" + i]) {
        previousLevelTime += teamData["level" + i];
      }
    }

    const currentLevelTime =
      this.currentTime - previousLevelTime - teamData.start;
    if (teamData.currentState !== "level" + levelIndex) {
      return "gray";
    } else {
      if (currentLevelTime <= estimatedTimeForLevel) {
        return "green";
      }
      if (
        estimatedTimeForLevel < currentLevelTime &&
        currentLevelTime <= 1.5 * estimatedTimeForLevel
      ) {
        return "orange";
      }
      if (currentLevelTime > 1.5 * estimatedTimeForLevel) {
        return "red";
      }
    }
  }

  createStatePatterns() {
    const states = ["green", "orange", "red", "gray"];
    const defs = this.plan.append("defs");
    const pattern = defs
      .selectAll("pattern")
      .data(states)
      .enter()
      .append("pattern")
      .attr("id", (d: string): string => "diagonalHatch-" + d)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", "7")
      .attr("height", "4")
      .attr("patternTransform", "rotate(45)");
    pattern
      .append("rect")
      .attr("width", "3")
      .attr("height", "4")
      .attr("transform", "translate(0,0)")
      .attr("fill", (d): string => d)
      .style("opacity", (color) => (color === "gray" ? "0.5" : "1"));
  }

  createBoundingLines(layers) {
    // draw bounding lines for each team
    const boundWidth = 2;
    this.bounds = this.trainingChart.append("g").attr("class", "bounds");
    if (this.view === View.Overview) {
      const boundGroups = this.bounds
        .selectAll(".bounds-layer")
        .data(layers)
        .enter()
        .append("g")
        .attr("class", "bounds-layer")
        .style("fill", (d: GenericObject, i: string): string => {
          return this.getPlanColor(+i);
        });

      this.boundSegments = boundGroups
        .selectAll("rect.plan-bound")
        .data((d: GenericObject): GenericObject => d)
        .enter()
        .append("rect")
        .attr("y", (d: GenericObject): number =>
          this.yScale(String(d.data.playerName))
        )
        .attr("x", (d: GenericObject): string =>
          (<number>this.xScale(d[1]) - boundWidth).toString()
        )
        .attr("height", this.yScale.bandwidth())
        .attr("width", boundWidth);
    }
  }

  drawTraining(trainingConfig: TrainingConfig): void {
    const d3: D3 = this.d3,
      trainingData: TrainingData = trainingConfig.data,
      eventShapePaths = trainingConfig.eventShapePaths,
      stack = d3.stack().keys(trainingData.keys).offset(d3.stackOffsetNone),
      layers = stack(trainingData.teams), // !!
      view = this.view;

    this.time = trainingConfig.time;
    this.trainingDomain = Math.max(
      this.time,
      d3.max(
        layers[layers.length - 1],
        (d: number[]): number => d["data"].totalTime
      )
    );

    if (!isNaN(this.trainingDomain)) {
      this.xScale.domain([0, Math.max(this.planDomain, this.trainingDomain)]);
    }

    this.updateXAxis();
    const layer = this.createColumnForEachLevel(layers);

    // draw segment (row in column) for each team
    this.createSegmentForEachTeam({
      layer: layer,
      trainingData: trainingData,
      layers: layers,
      view: view,
    });

    // update plan according to actual data
    this.updatePlan(trainingData);
    // tooltip for events
    this.createEventTooltips();

    const eventIconWidth = 17,
      groupCircleWidth = 18;

    // group events
    this.groupEvents(eventIconWidth);

    this.createEvents({
      trainingData: trainingData,
      eventShapePaths: eventShapePaths,
      groupCircleWidth: groupCircleWidth,
      eventIconWidth: eventIconWidth,
    });

    // pan bounds to top
    this.bounds.raise();

    // append time axis
    this.createTimeline();

    // add labels to header above the bounds, for sorting by level time
    this.createSortingLabels(trainingData);
  }

  updateXAxis() {
    this.xAxis = this.d3
      .axisBottom(this.xScale)
      .tickFormat((d: any) => this.getXAxisTickFormat(d))
      .tickSize(5)
      .tickValues(this.d3.range(0, this.time, this.getXAxisTickInterval()));
    this.d3.select(".axis.axis-x").call(this.xAxis as any);
  }

  createColumnForEachLevel(layers) {
    const training = this.trainingChart.append("g").attr("class", "training");
    return training
      .selectAll(".training-layer")
      .data(layers)
      .enter()
      .append("g")
      .attr("class", "training-layer")
      .attr("fill", (d: GenericObject, i: string): string => {
        return this.getColor(+i);
      });
  }

  createSegmentForEachTeam({ layer, trainingData, layers, view }) {
    const xScale: ScaleLinear<number, number> = this.xScale;
    const time: number = this.time;
    layer
      .selectAll("rect.training-segment")
      .data((d: GenericObject): GenericObject => d)
      .enter()
      .append("rect")
      .attr("y", (d: GenericObject): number => this.yScale(d.data.playerName))
      .attr("x", (d: GenericObject, i: number): number => {
        const x: number = d[0];
        // when sorting by level, align the teams by this level
        if (this.view === View.Overview && this.sortType === "level") {
          if (typeof trainingData.teams[i].offsets === "undefined") {
            trainingData.teams[i].offsets = [];
          }
          if (
            typeof trainingData.teams[i].offsets[this.sortLevel] === "undefined"
          ) {
            if (typeof this.sortLevel === "undefined") {
              // trainingData.teams[i].offsets[this.sortLevel] = 0;
            } else {
              const levelsTimePlanSum = this.levelsTimePlan
                .slice(0, this.sortLevel - 1)
                .reduce((a, b) => a + b, 0);
              const teamLevelStart = layers[this.sortLevel - 1][i][0];
              trainingData.teams[i].offsets[this.sortLevel] =
                levelsTimePlanSum - teamLevelStart;
            }
          }
          return (
            this.xScale(x) +
            this.xScale(trainingData.teams[i].offsets[this.sortLevel])
          );
        } else {
          return this.xScale(x);
        }
      })
      .attr("height", this.yScale.bandwidth())
      .attr("width", (d: GenericObject, i: number, nodes) => {
        const level: GenericObject = <GenericObject>(
            this.d3.select(nodes[i].parentNode).datum()
          ),
          levelIndex: number = level.index,
          levelKey: string =
            view === View.Overview
              ? "level" + (levelIndex + 1)
              : "level" + levelIndex,
          data: NumericObject = layers[levelIndex][i]["data"],
          currentLevelData: number = layers[levelIndex][i]["data"][levelKey],
          currentState: string = data["currentState"];
        const allNodes = this.d3.select(nodes[i]);
        allNodes
          .classed("preserved", (data: any) =>
            this.runsToCompare.some((run) => run.id === data.data.id)
          )
          .classed(
            "faded",
            (data: any) =>
              this.runsToCompare.length > 0 &&
              !this.runsToCompare.some((run) => run.id === data.data.id)
          );

        if (
          typeof currentLevelData === "undefined" ||
          this.view === View.Overview
        ) {
          allNodes
            .classed("training-segment-finished", true)
            .style("opacity", () =>
              this.sortLevel !== 0 &&
              typeof data["level" + this.sortLevel] === "undefined" &&
              currentState !== "level" + this.sortLevel
                ? 0.3
                : 0.5
            );
        }

        if (this.view === View.Progress) {
          allNodes.classed("training-segment-finished", false);
        }

        let finalWidth = 0;
        if (typeof currentLevelData !== "undefined") {
          finalWidth = xScale(d[1]) - xScale(d[0]);
          if (this.view === View.Progress) finalWidth -= 2;
        } else if (currentState === levelKey) {
          if (this.view === View.Overview)
            finalWidth = xScale(this.levelsTimePlan[levelIndex]);
          else finalWidth = xScale(time) - xScale(d[0]);
        }
        return finalWidth;
      })
      .on("mouseover", (event, d: GenericObject) => {
        this.highlightedPlayer.emit(d.data.playerId);
        // highlight team on hover
        this.outerWrapper.classed("ctf-progress-hover", true);
        this.d3
          .selectAll(".data text")
          .filter((data: any) => data.playerId === d.data.playerId)
          .classed("data-hover", true);
        this.d3
          .selectAll(".training .training-layer rect")
          .filter((data: any) => data.data.playerId === d.data.playerId)
          .classed("data-hover", true);
        this.tooltip
          .transition()
          .duration(200)
          .delay(500)
          .style("opacity", 0.9);

        let thisLevel;
        const datum: GenericObject = this.d3
          .select(event.currentTarget.parentNode)
          .datum();
        thisLevel =
          view == View.Overview
            ? this.findLevelByKey(datum.index + 1)
            : this.findLevelByKey(datum.index);
        this.tooltip
          .html((): string => {
            return (
              "<div>" +
              '<span class="ctf-progress-tooltip-item"> ' +
              (thisLevel.levelType === "info"
                ? "Info level"
                : thisLevel.levelType === "access"
                ? "Access level"
                : thisLevel.levelType === "assessment"
                ? "Questionnaire level"
                : "Level " + this.getTrainingLevelIndex(thisLevel)) +
              " </span>" +
              "<span>" +
              thisLevel.title +
              "</span>" +
              "</div>"
            );
          })
          // @ts-ignore
          .style("left", event.offsetX + "px")
          // @ts-ignore
          .style("top", event.offsetY + "px");
        if (this.eventService) {
          this.eventService.trainingAnalysisOnBarMouseover(
            d.data.id.toString()
          );
        }
      })
      .on("mouseout", (_, d: GenericObject) => {
        this.tooltip.transition().duration(0).style("opacity", 0);
        // remove team highlighting
        if (this.runsToCompare.length === 0)
          this.outerWrapper.classed("ctf-progress-hover", false);
        this.d3
          .selectAll(".data text")
          .filter(
            (data: any) => !this.runsToCompare.some((run) => run.id === data.id)
          )
          .classed("data-hover", false);
        this.d3
          .selectAll(".training .training-layer rect")
          .filter((data: any) => data.data.id === d.data.id)
          .classed("data-hover", false);
        if (this.eventService) {
          this.eventService.trainingAnalysisOnBarMouseout(d.data.id.toString());
        }
      })
      .on("click", (_, d) => {
        if (this.runsToCompare.some((run) => run.id === d.data.id)) {
          this.runsToCompare = this.runsToCompare.filter(
            (item) => item.id !== d.data.id
          );
        } else {
          this.runsToCompare.push({
            id: d.data.id,
            avatar: d.data.playerAvatar,
          });
        }
        if (this.eventService) {
          this.eventService.trainingAnalysisOnBarClick(d.data.id.toString());
        }
        if (this.selectedTrainees.indexOf(d.data.trainingRunId) !== -1) {
          this.selectedTrainees.splice(
            this.selectedTrainees.indexOf(d.data.trainingRunId),
            1
          );
        } else {
          this.selectedTrainees.push(d.data.trainingRunId);
        }
        this.outputSelectedPlayers.emit(this.selectedTrainees);

        this.outerWrapper.classed("ctf-progress-hover", true);
        this.d3
          .selectAll(".data text")
          .filter((data: any) => data.id === d.data.id)
          .classed("data-hover", true);
        this.d3
          .selectAll(".training .training-layer rect")
          .filter((data: any) => data.data.id === d.data.id)
          .classed("preserved", (data: any) => {
            if (this.view == View.Overview) {
              return this.selectedTrainees.some(
                (run) => run === data.data.trainingRunId
              );
            } else {
              return this.runsToCompare.some((run) => run.id === data.data.id);
            }
          });
        if (this.view === View.Overview) {
          // in progress view we want to keep the unfinished levels highlighted
          this.d3
            .selectAll(".training .training-layer rect")
            .classed("faded", () => {
              if (this.view == View.Overview) {
                return this.selectedTrainees.length > 0;
              } else {
                return this.runsToCompare.length > 0;
              }
            });
        }
      })
      .style("fill", (d: GenericObject, i: string, nodes) => {
        const level: GenericObject = <GenericObject>(
            this.d3.select(nodes[i].parentNode).datum()
          ),
          levelIndex: number = level.index,
          levelKey: string =
            view === View.Overview
              ? "level" + (levelIndex + 1)
              : "level" + levelIndex,
          teamIndex: number = +i,
          data: NumericObject = layers[levelIndex][teamIndex]["data"],
          currentState: string = data["currentState"];
        if (this.view === View.Overview) {
          if (currentState === levelKey) {
            return "url(#diagonalHatch" + levelIndex + ")";
          }
        }

        if (view === View.Progress) {
          return this.getSegmentColor(data["playerName"], levelIndex);
        }
        return (r: GenericObject, i: string): string => this.getPlanColor(+i);
      });
  }

  findLevelByKey(levelIndex: number): Level {
    return this.levels[levelIndex - 1];
  }

  getTrainingLevelIndex(level: Level): number {
    const trainingLevels = this.levels.filter(
      (level) => level.levelType == LevelTypeEnum.Training
    );
    return trainingLevels.indexOf(level) + 1;
  }

  updatePlan(trainingData: TrainingData): void {
    const d3: D3 = this.d3,
      offset: number[] = [],
      xScale: ScaleLinear<number, number> = this.xScale,
      stack = d3.stack().keys(trainingData.keys).offset(d3.stackOffsetNone),
      layers = stack(trainingData.teams),
      view = this.view;

    // pan plan to top
    this.plan.raise();
    this.planSegments
      .style("opacity", (d: GenericObject, i: number, nodes): number => {
        const level: GenericObject = <GenericObject>(
            d3.select(nodes[i].parentNode).datum()
          ),
          levelIndex: number = level.index,
          levelKey: string = "level" + levelIndex,
          teamIndex: number = i,
          data: NumericObject = layers[levelIndex][teamIndex]["data"],
          currentState: string = data["currentState"];
        if (view === View.Overview) return 0;
        if (currentState === "FINISHED") return 0;
        if (
          currentState === levelKey ||
          levelIndex >= parseInt(currentState.split("level")[1])
        )
          return 1;
        return 0;
      })
      .attr("x", (d: any, i: number, nodes): number => {
        const level: GenericObject = <GenericObject>(
            d3.select(nodes[i].parentNode).datum()
          ),
          levelIndex: number = level.index,
          teamIndex: number = i,
          currentData: NumericObject = layers[levelIndex][teamIndex],
          isUnfinishedLevel: boolean = isNaN(currentData[1]),
          currentState = currentData["data"]["currentState"];
        let x: number = d[0];

        if (isUnfinishedLevel && "level" + levelIndex === currentState) {
          offset[teamIndex] = currentData[0] - x;
        } else if (isUnfinishedLevel && "level" + levelIndex !== currentState) {
          let num = 0;
          // first we want to compute the added distance based on the previous extimated times
          for (
            let j = 1;
            levelIndex - j > currentState.split("level")[1];
            j++
          ) {
            const computedEstimate = d["data"]["level" + (levelIndex - j)];
            if (computedEstimate !== undefined) {
              num += computedEstimate;
            }
          }
          // now we will check if the player is behind the current scheduled estimate or not
          const currentEstimate = d["data"][currentState];
          if (currentData[0] + currentEstimate > this.time) {
            return xScale(Math.max(1, currentData[0] + currentEstimate + num));
          }
          return xScale(Math.max(1, this.time + num));
        }
        if (offset[teamIndex] !== undefined) {
          x = x + offset[teamIndex];
        }
        return xScale(Math.max(1, x));
      })
      .attr(
        "width",
        (d: GenericObject): number =>
          // rescale to new x domain
          this.xScale(d[1]) - this.xScale(d[0])
      )
      .style("transform", (d: GenericObject, i: number): string => {
        let teamOffset = 0;
        if (
          typeof trainingData.teams[i].offsets !== "undefined" &&
          typeof trainingData.teams[i].offsets[this.sortLevel] !== "undefined"
        ) {
          teamOffset = trainingData.teams[i].offsets[this.sortLevel];
        }
        return "translateX(" + xScale(teamOffset) + "px)";
      });

    // rescale bounds (xScale could change)
    if (this.view === View.Overview) {
      this.boundSegments.attr("x", (d: GenericObject): number =>
        this.xScale(d[1])
      );
    }
  }

  createEventTooltips() {
    if (typeof this.tooltip !== "undefined") this.tooltip.remove();

    this.tooltip = this.d3
      .select("#ctf-progress-chart")
      .append("div")
      .attr("class", "ctf-progress-tooltip")
      .style("opacity", 0);
  }

  groupEvents(eventIconWidth: number): void {
    const eventsDataset: GenericObject[] = this.trainingData.teams.slice(0);
    eventsDataset.forEach((team) => {
      const eventsGroups: GenericObject[] = [];
      if (Array.isArray(team.events) && team.events.length > 0) {
        const first: Event = team.events[0],
          lastIndex: number = team.events.length - 1;
        let previousEvent: Event = null,
          group: any = {
            events: [],
            level: first.levelNumber,
          },
          previousOffset = false,
          isDuplicated = false;

        team.events.forEach((event: Event, index) => {
          if (previousEvent != null) {
            const levelX: number = this.xScale(
                team["level" + event.levelNumber]
              ),
              eventX: number = this.xScale(event.timestamp),
              currentEventX: number =
                levelX - eventX < eventIconWidth / 2
                  ? eventX - eventIconWidth / 2
                  : eventX,
              previousEventX: number = previousOffset
                ? this.xScale(previousEvent.timestamp) + eventIconWidth / 2
                : this.xScale(previousEvent.timestamp),
              diff: number = currentEventX - previousEventX;
            isDuplicated =
              event.getContent() === previousEvent.getContent() &&
              event.timestamp === previousEvent.timestamp &&
              event.levelNumber === previousEvent.levelNumber;

            if (
              diff > 7 ||
              event.levelNumber !== previousEvent.levelNumber ||
              event.type !== previousEvent.type
            ) {
              const groupCopy: any = Object.assign({}, group);
              eventsGroups.push(groupCopy);
              group = {
                events: [],
                level: event.levelNumber,
              };
            }
          }
          previousOffset = this.xScale(event.timestamp) < eventIconWidth / 2;

          // don't push duplicated events
          if (!isDuplicated) group.events.push(event);
          previousEvent = event;

          if (index === lastIndex) {
            const groupCopy: any = Object.assign({}, group);
            eventsGroups.push(groupCopy);
          }
        });
      }
      eventsGroups.forEach((group) => {
        const events = group.events;
        const groupLevelX: number = this.xScale(team["level" + group.level]);
        const firstGroupEvent: Event = events[0];
        const lastGroupEvent: Event = events[events.length - 1];
        const firstX: number = this.xScale(firstGroupEvent.trainingTime);
        const lastX: number = this.xScale(lastGroupEvent.trainingTime);
        let x: number;
        if (firstX === lastX) x = firstX;
        else x = firstX + (lastX - firstX) / 2;

        if (this.view === View.Progress) x += this.xScale(team["start"]);
        if (x < eventIconWidth / 2 || groupLevelX < eventIconWidth * 2)
          x += eventIconWidth / 2;
        if (
          typeof groupLevelX !== "undefined" &&
          groupLevelX - x < eventIconWidth / 2
        )
          x -= eventIconWidth / 2;
        group["x"] = x;
      });
      team.eventsGroups = eventsGroups;
    });
  }

  createEvents({
    trainingData,
    eventShapePaths,
    groupCircleWidth,
    eventIconWidth,
  }) {
    const d3 = this.d3;
    const eventsLayer: any = this.trainingChart
      .append("g")
      .attr("class", "events");
    const eventLayers: any = eventsLayer
      .selectAll("g.events-row")
      .data(trainingData.teams)
      .enter()
      .append("g")
      .attr("class", "events-row")
      .style("transform", (d: GenericObject, i: number): string => {
        let teamOffset = 0;
        if (
          typeof trainingData.teams[i].offsets !== "undefined" &&
          typeof trainingData.teams[i].offsets[this.sortLevel] !== "undefined"
        ) {
          teamOffset = trainingData.teams[i].offsets[this.sortLevel];
        }
        return "translateX(" + this.xScale(teamOffset) + "px)";
      })
      .attr("data-index", (d: GenericObject, i: number): number => i)
      .on("mouseover", (_, d: any) => {
        // preserve team highlight
        this.outerWrapper.classed("ctf-progress-hover", true);
        d3.selectAll(".data text:nth-child(" + (d.teamIndex + 1) + ")").classed(
          "data-hover",
          true
        );
      })
      .on("mouseout", (_, d: any) => {
        if (this.runsToCompare.length > 0) return;
        this.outerWrapper.classed("ctf-progress-hover", false);
        d3.selectAll(".data text:nth-child(" + (d.teamIndex + 1) + ")").classed(
          "data-hover",
          false
        );
      });

    eventLayers
      .selectAll("path.event")
      .data((d: GenericObject): Event[] => d.eventsGroups)
      .enter()
      .append("path")
      .attr("class", "event")
      .style("display", (group) => this.setEventGroupVisibility(group))
      .attr("d", (group: GenericObject): string => {
        if (group.events.length === 1) {
          const event: any = group.events[0];
          return eventShapePaths[event.type];
        } else {
          return eventShapePaths[group.events[0].type];
        }
      })
      .attr("fill", (d: GenericObject, i, nodes): string => {
        const teamStruct: DataEntry = <DataEntry>(
          d3.select(nodes[i].parentNode).datum()
        );
        let colorIndex: number = +d.level;
        if (this.view === View.Overview) colorIndex -= 1; // in final overview is no first transparent column for start
        // check if the event is in current unfinished level
        return teamStruct["currentState"] === "level" + d.level &&
          this.view === View.Progress
          ? this.getSegmentColor(d.events[0].playerName, d.level)
          : this.view !== View.Overview
          ? this.getSegmentColor(d.events[0].playerName, d.level)
          : this.getPlanColor(colorIndex);
      })
      .attr("stroke", "#eee")
      .attr("transform", (group: GenericObject, i: number, nodes): string => {
        // event absolute time from training start
        const iconWidth: number =
          group.events.length > 1 ? groupCircleWidth : eventIconWidth;
        const scale = group.events.length > 1 ? 1.2 : 1; // a group with multiple events is a bit enlarged
        const teamStruct: DataEntry = <DataEntry>(
          d3.select(nodes[i].parentNode).datum()
        );
        let y =
          this.yScale(teamStruct.playerName) +
          this.yScale.bandwidth() * 0.5 -
          iconWidth / 2;
        y -= group.events.length > 1 ? 1.5 : 0;
        const x = group.x - iconWidth / 2;
        return "translate(" + x + "," + y + ") scale(" + scale + ")";
      })
      .on("mouseover", (_, d: any) => {
        this.tooltip.transition().duration(200).style("opacity", 0.9);
        const teamNode = d,
          teamStruct: DataEntry = <DataEntry>teamNode,
          y =
            this.yScale(teamStruct.playerName) +
            this.yScale.bandwidth() * 0.5 +
            3;
        let teamOffset = 0;
        const teamIndex: string = teamNode.level;
        if (
          typeof trainingData.teams[teamIndex]?.offsets !== "undefined" &&
          typeof trainingData.teams[teamIndex]?.offsets[this.sortLevel] !==
            "undefined"
        ) {
          teamOffset = trainingData.teams[teamIndex].offsets[this.sortLevel];
        }
        const x = d.x + 2 + this.panValue + this.xScale(teamOffset);
        this.tooltip
          .html((): string => {
            let text = "";
            d.events.forEach((event) => {
              const item = [];
              item.push(
                '<span class="ctf-progress-tooltip-item">',
                '<svg width="14" height="14" viewBox="0 0 16 16">',
                '<path d="' + eventShapePaths[event.type] + '"/>',
                "</svg>",
                this.resolveEventTooltip(event),
                "</span>"
              );
              text += item.join("");
            });
            return text;
          })
          .style("left", x + "px")
          .style("top", y + "px");
      })
      .on("mouseout", () => {
        this.tooltip.transition().duration(0).style("opacity", 0);
      });

    eventLayers
      .selectAll("text.event-number")
      .data((d: GenericObject): Event[] => d.eventsGroups)
      .enter()
      .append("text")
      .filter((group) => group.events.length > 1)
      .style("display", (group) => this.setEventGroupVisibility(group))
      .attr("class", "event-number")
      .attr("y", (d: GenericObject, i: number, nodes): string => {
        const teamStruct: DataEntry = <DataEntry>(
            d3.select(nodes[i].parentNode).datum()
          ),
          y =
            this.yScale(teamStruct.playerName) +
            this.yScale.bandwidth() * 0.5 +
            groupCircleWidth / 5;
        return y.toString();
      })
      .attr("x", (group: GenericObject): string => {
        return group.x.toString();
      })
      .attr("fill", "#fff")
      .attr("font-size", "11px")
      .attr("text-anchor", "middle")
      .text((group): string => group.events.length.toString());
  }

  resolveEventTooltip(event: Event) {
    switch (event.type) {
      case "hint":
        return "Hint <i>" + (event as HintTakenEvent).hintTitle + "</i> taken";
      case "wrong":
        return (
          "Wrong answer submitted: <i>" +
          (event as WrongAnswerEvent).answerContent +
          "</i>"
        );
      case "solution":
        return "Solution displayed";
    }
    return "";
  }

  setEventGroupVisibility(group) {
    if (this.externalFilters === undefined) return "block";
    if (group.events[0].type === "hint") {
      return this.externalFilters.hintFilter.checked ? "block" : "none";
    }
    if (group.events[0].type === "wrong") {
      return this.externalFilters.wrongAnswerFilter.checked ? "block" : "none";
    }
    if (group.events[0].type === "skip") {
      return this.externalFilters.skipFilter.checked ? "block" : "none";
    }
    return "block";
  }

  createTimeline() {
    if (this.view === View.Progress) {
      this.timeline = this.trainingChart
        .append("line")
        .attr("class", "timeline")
        .attr("x1", this.xScale(this.time) - 2)
        .attr("y1", 0)
        .attr("x2", this.xScale(this.time) - 2)
        .attr("y2", this.height)
        .attr("stroke-width", 3);
    }
  }

  createSortingLabels(trainingData) {
    let previous = 0;
    let difference = 0;
    if (this.view === View.Overview && trainingData["teams"].length) {
      trainingData["levels"].forEach(
        (levelKey: string, index: number): void => {
          // let levelTime: number = this.levelTimePlan;
          const levelsTimePlanSum = this.levelsTimePlan
            .slice(0, index + 1)
            .reduce((a, b) => a + b, 0);
          const x: number = this.xScale(levelsTimePlanSum);

          difference = levelsTimePlanSum - previous;
          previous = levelsTimePlanSum;

          let sortLevelName: string;
          if (this.levels[index].levelType === "info") {
            sortLevelName = difference > 530 ? "Info" : "I";
          }
          if (this.levels[index].levelType === "access") {
            sortLevelName = difference > 530 ? "Access" : "A";
          }
          if (this.levels[index].levelType === "assessment") {
            sortLevelName = difference > 530 ? "Q" : "Q";
          }
          if (this.levels[index].levelType === "training") {
            let levelNum = 0;
            for (let i = 0; i <= index; i++) {
              if (this.levels[i].levelType === "training") {
                levelNum++;
              }
            }
            sortLevelName =
              difference > 530 ? "Level " + levelNum : "L" + levelNum;
          }
          this.levelSortOptions.push({
            index: index + 1,
            key: levelKey,
            name: sortLevelName,
            x: x + "px",
            translate: "translate(calc(-100% + 5px), 0)",
          });
        }
      );
    }
  }

  private addPlayerName(teamDataLayer, trainingData: TrainingData) {
    teamDataLayer
      .selectAll("text.data-team")
      .data(this.trainingData.teams)
      .enter()
      .append("text")
      .attr("playerId", (d: GenericObject) => d.playerId)
      .text((d: GenericObject): string => d.playerName)
      .attr(
        "y",
        (d: GenericObject): number =>
          this.yScale(d.playerName) +
          this.yScale.bandwidth() * 0.6 +
          this.padding.top
      )
      .attr("x", 130)
      .style("text-anchor", "end")
      .attr("cursor", () => (this.view == "progress" ? "pointer" : "default"));
  }

  private addPlayerAvatar(teamDataLayer, trainingData: TrainingData) {
    teamDataLayer
      .selectAll("text.data-team")
      .data(this.trainingData.teams)
      .enter()
      .append("image")
      .attr("playerId", (d: GenericObject) => d.playerId)
      .attr(
        "xlink:href",
        (d: GenericObject): string => "data:image/png;base64," + d.playerAvatar
      )
      .attr("width", 15)
      .attr("height", 15)
      .attr(
        "y",
        (d: GenericObject): number =>
          this.yScale(d.playerName) +
          this.yScale.bandwidth() * 0.6 +
          this.padding.top -
          10
      )
      .attr("x", 120)
      .attr("cursor", () => (this.view == "progress" ? "pointer" : "default"));
  }

  addDataColumns() {
    // append columns with data (team, time, score)
    this.addOneColumn("time", true);
    this.addOneColumn("score", true);
    this.addOneColumn("hints", true);
    this.addOneColumn("answers", true);
    const teamDataLayer: any = this.addOneColumn("team");
    const compareDataLayer: any = this.addOneColumn("compare");

    if (this.selectedPlayerView === "avatar") {
      this.addPlayerAvatar(teamDataLayer, this.trainingData);
    } else {
      this.addPlayerName(teamDataLayer, this.trainingData);
    }

    const colors: string[] =
      this.playerColorScheme || this.appConfig.playerColors;
    compareDataLayer
      .selectAll("text.data-compare")
      .data(this.trainingData.teams)
      .enter()
      .append("svg")
      .attr("height", this.yScale.bandwidth())
      .attr("width", "5")
      .attr("y", (d: GenericObject): number => this.yScale(d.playerName) + 8)
      .attr("x", 0)
      .append("path")
      .attr("width", "5")
      .attr("fill", (d, i) => {
        if (d.compare === undefined) {
          d.compare = colors[i];
        }
        return d.compare;
      })
      .attr("d", (d) => {
        const h = this.yScale.bandwidth();
        const w = 5;
        return "M0 " + h + " L " + w + " " + h + " L" + w + " 0 L0 0 Z";
      });
  }

  private addOneColumn(name, append = false) {
    this.d3.select("#" + this.dataColumns[name]).html("");

    const data: any = this.d3
      .select("#" + this.dataColumns[name])
      .append("svg")
      .attr("height", this.wrapperHeight)
      .attr("width", 90);
    const dataLayer: any = data.append("g").attr("class", "data");

    if (append) {
      dataLayer
        .selectAll("text.data-time")
        .data(this.trainingData.teams)
        .enter()
        .append("text")
        .text((d: GenericObject): string =>
          name === "time" && !isNaN(d.totalTime)
            ? this.getTimeString(d.totalTime)
            : this.view === View.Progress
            ? ""
            : name === "score" && !isNaN(d.score)
            ? d.score
            : name === "hints" && !isNaN(d.hints)
            ? d.hints
            : name === "answers" && !isNaN(d.hints)
            ? d.answers
            : ""
        )
        .attr(
          "y",
          (d: GenericObject): number =>
            this.yScale(d.playerName) +
            this.yScale.bandwidth() * 0.6 +
            this.padding.top
        )
        .attr("x", 0);
    }
    return dataLayer;
  }

  pan(left?: number) {
    if (typeof this.trainingChart === "undefined") {
      return;
    }

    if (typeof left === "undefined") left = 0;
    let pan: number = this.panValue + left;
    pan = Math.max(-(this.width - this.wrapperWidth), pan);
    pan = Math.min(0, pan);
    this.trainingChart.style("transform", "translate(" + pan + "px, 0)");
    this.d3
      .selectAll("#ctf-progress-time")
      .style("transform", "translate(" + pan + "px ,0px)");
  }

  onResize() {
    this.drawChart();
  }

  onMouseWheelUp($event: any) {
    if (this.zoomValue < this.appConfig.maxZoomValue) {
      const newZoomValue = Math.min(
          this.appConfig.maxZoomValue,
          this.zoomValue + this.appConfig.zoomStep
        ),
        scale = newZoomValue / this.zoomValue,
        dx =
          (-$event.left + this.panValue) * scale + $event.left - this.panValue;

      this.zoomValue = newZoomValue;
      this.drawChart();

      // because of team highlighting animation, add class which cancels the animation after zoom
      this.outerWrapper.classed("ctf-progress-zoom", true);
      setTimeout(() => {
        this.outerWrapper.classed("ctf-progress-zoom", false);
      }, 150);

      this.pan(dx);
      this.updatePanValue();
    }
  }

  onMouseWheelDown($event: any) {
    if (this.zoomValue > 1) {
      const newZoomValue = Math.max(
          1,
          this.zoomValue - this.appConfig.zoomStep
        ),
        scale = newZoomValue / this.zoomValue,
        dx =
          (-$event.left + this.panValue) * scale + $event.left - this.panValue;

      this.zoomValue = newZoomValue;
      this.drawChart();

      // because of team highlighting animation, add class which cancels the animation after zoom
      this.outerWrapper.classed("ctf-progress-zoom", true);
      setTimeout(() => {
        this.outerWrapper.classed("ctf-progress-zoom", false);
      }, 150);

      this.pan(dx);
      this.updatePanValue();
    }
  }

  onMouseDrag($event: any) {
    this.pan($event.left);
  }

  onMouseUp() {
    this.updatePanValue();
  }

  setSort(level: Level) {
    this.sortType = "active-level";
    this.sortReverse =
      level.id === this.levelSorted?.id ? !this.sortReverse : false;
    this.sortLevel = level.order + 1;
    this.levelSorted = level;
    this.drawChart();
  }

  onFilterValueChange(): void {
    this.setFilterStatus();
    this.drawChart();
  }

  onSortValueChange(
    sortType: string,
    sortReverse: boolean,
    levelIndex?: number
  ): void {
    this.sortType = sortType;
    this.sortReverse = sortReverse;
    if (typeof levelIndex !== "undefined") {
      this.sortLevel = levelIndex;
    } else {
      this.sortLevel = 0;
    }
    this.drawChart();
    if (this.runsToCompare.length > 0) {
      this.outerWrapper.classed("ctf-progress-hover", true);
      this.d3
        .selectAll(".data text")
        .filter((data: any) =>
          this.runsToCompare.some((run) => run.id === data.playerName)
        )
        .classed("data-hover", true);
    }
  }

  updatePanValue() {
    if (typeof this.trainingChart === "undefined") return;

    const transform: string = this.trainingChart.style("transform"),
      translate: string[] = transform
        .substring(transform.indexOf("translate(") + 10, transform.indexOf(")"))
        .split(","),
      xStr: string = translate[0];

    let x: number = parseInt(xStr.substr(0, xStr.length - 2));
    if (!x) x = 0;
    this.panValue = x;
  }

  getColor(level: number): string {
    const colors: string[] =
      this.colorScheme || this.configService.trainingColors;
    if (this.view === View.Progress) {
      if (level === 0) return "transparent";
      else level -= 1;
    }
    const colorsCount: number = colors.length;
    return colors[level % colorsCount];
  }

  getPlanColor(level: number): string {
    const colors: string[] =
      this.colorScheme || this.configService.trainingColors;
    if (this.view === View.Progress) {
      if (level === 0) return "transparent";
      else level -= 1;
    }
    const colorsCount: number = colors.length;
    const color = this.d3.hsl(colors[level % colorsCount]);
    return color.darker(1.1).toString();
  }

  getLightenedColor(level: number): string {
    const colors: string[] =
      this.colorScheme || this.configService.trainingColors;
    if (this.view === View.Progress) {
      if (level === 0) return "transparent";
      else level -= 1;
    }
    const colorsCount: number = colors.length;
    const color = this.d3.hsl(colors[level % colorsCount]);
    return color.brighter(0.8).toString();
  }

  clear(): void {
    this.d3.select("#ctf-progress-chart").html("");
    this.d3.selectAll(".ctf-progress-column-data").html("");
  }

  setFilterStatus(): void {
    switch (this.selectedFilterValue) {
      case 1:
        this.filterStatus = "";
        break;
      case 2:
        this.filterStatus = "finished";
        break;
      case 3:
        this.filterStatus = "unfinished";
        break;
    }
  }

  highlightGivenPlayer(playerId: number): void {
    this.outerWrapper?.classed("ctf-progress-hover", true);
    // remove fade class from text
    this.d3
      .selectAll(".data text")
      .filter((data: any) => {
        return data.playerId === playerId;
      })
      .classed("fade", false);

    // remove fade class from training segments
    this.d3
      .selectAll(".training .training-layer rect")
      .filter((data: any) => {
        return data.data.playerId === playerId;
      })
      .classed("fade", false);

    // remove fade class from plan segments
    this.d3
      .selectAll(".plan .plan-layer rect")
      .filter((data: any) => {
        return data.data.playerId === playerId;
      })
      .classed("fade", false)
      .classed("hidden", false);

    // remove fade class from events
    this.d3
      .selectAll(".events .events-row path")
      .filter((data: any) => {
        return data.events[0].playerId === playerId;
      })
      .classed("fade", false);
  }

  unhighlightGivenPlayer(playerId: number): void {
    this.outerWrapper?.classed("ctf-progress-hover", false);
    // add fade class to text
    this.d3
      .selectAll(".data text")
      .filter((data: any) => data.playerId === playerId)
      .classed("fade", true);

    // add fade class to training segments
    this.d3
      .selectAll(".training .training-layer rect")
      .filter((data: any) => data.data.playerId === playerId)
      .classed("fade", true);

    // add fade class to plan segments
    this.d3
      .selectAll(".plan .plan-layer rect")
      .filter((data: any) => {
        return data.data.playerId === playerId;
      })
      .classed("fade", true);

    const totalTime = this.trainingDataSet.find(
      (player) => player.playerId == playerId
    ).totalTime;

    // add hidden class to plan segments for already passed levels
    this.d3
      .selectAll(".plan .plan-layer rect")
      .filter((data: any) => {
        return data.data.playerId === playerId && data[1] < totalTime;
      })
      .classed("hidden", true);

    // add fade class to events
    this.d3
      .selectAll(".events .events-row path")
      .filter((data: any) => {
        return data.events[0].playerId === playerId;
      })
      .classed("fade", true);
  }

  /**
   * unused method, to preserve players based on event from distinct visualization
   * missing method to match avatars
   * @param playerId
   */
  preserveHighlightedPlayer(playerId: string): void {
    if (this.runsToCompare.some((run) => run.id === playerId)) {
      this.runsToCompare = this.runsToCompare.filter(
        (item) => item.id !== playerId
      );
    } else {
      this.runsToCompare.push({ id: playerId, avatar: "" });
    }

    this.d3
      .selectAll(".training .training-layer rect")
      .filter((data: any) => data.data.id === playerId)
      .classed("preserved", (data: any) =>
        this.runsToCompare.includes(data.data.id)
      );

    if (this.view === View.Overview) {
      // in progress view we want to keep the unfinished levels highlighted
      this.d3
        .selectAll(".training .training-layer rect")
        .classed("faded", (data: any) =>
          this.runsToCompare.length > 0 ? true : false
        );
    }
  }

  onFilterChange() {
    this.d3
      .selectAll(".events-row path.event")
      .style("display", (group) => this.setEventGroupVisibility(group));

    this.d3
      .selectAll(".events-row text.event-number")
      .style("display", (group) => this.setEventGroupVisibility(group));
  }

  onPlayerViewChange() {
    this.drawChart();
  }

  onPlayerDetailChange() {
    this.playerDetailId = null;
    this.drawChart();
  }

  onZoomReset() {
    this.zoomValue = 1;
    this.drawChart();
  }

  setHighlightedPlayer(player: Player) {
    if (player) {
      this.visualizationData.playerProgress.forEach((p) => {
        if (p.userRefId == player.userRefId) {
          this.highlightGivenPlayer(p.userRefId);
        } else {
          this.unhighlightGivenPlayer(p.userRefId);
        }
      });
    } else {
      this.visualizationData.playerProgress.forEach((p) => {
        this.highlightGivenPlayer(p.userRefId);
      });
    }
  }

  showPlayerDetail(event) {
    if (this.view == View.Progress)
      this.playerDetailId = event.path[0].attributes.playerId?.value;
  }

  ngOnDestroy() {
    if (this._activeDataSubscribtion) {
      this._activeDataSubscribtion.unsubscribe();
    }
    if (this._updateVisSubscribtion) {
      this._updateVisSubscribtion.unsubscribe();
    }
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
    if (this.highlightSubscription) {
      this.highlightSubscription.unsubscribe();
    }
  }

  getEventShapePaths() {
    return this.appConfig.eventShapePaths;
  }

  getTimeString(seconds: number): string {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds - hours * 3600) / 60);
    seconds = Math.floor(seconds - hours * 3600 - minutes * 60);

    return (
      hours.toString().padStart(2, "0") +
      ":" +
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0")
    );
  }
}
