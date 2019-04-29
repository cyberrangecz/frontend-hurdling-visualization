import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  Input,
  OnChanges
} from '@angular/core';
import { D3Service, D3, Axis, ScaleBand, ScaleLinear } from 'd3-ng2-service';
import { LoadDataService } from '../../services/load-data.service';
import { LoadCsvDataService } from '../../services/load-csv-data.service';
import { AppConfig } from '../../../app.config';
import { DataEntry } from '../../models/data-entry';
import { GameConfig } from '../../models/game-config';
import { PlanConfig } from '../../models/plan-config';
import { BaseConfig } from '../../models/base-config';
import { Data } from '../../models/data';
import { GameData } from '../../models/game-data';
import { PlanData } from '../../models/plan-data';
import { Event } from '../../models/event';
import { Padding } from '../../models/padding';
import { View } from '../../models/view.enum';
import { DataSource } from '../../models/data-source.enum';
import { GenericObject } from '../../models/generic-object.type';
import { NumericObject } from '../../models/numeric-object.type';
import { environment } from '../../../../environments/environment';
import { SortingService } from '../../services/sorting.service';
import { FilteringService } from '../../services/filtering.service';
import { PreparedData } from '../../models/preparedData';
import { GameAnalysisEventService } from '../../models/game-analysis-event-service';
import { HttpClient } from '@angular/common/http';
import {EVENTS} from '../../../../../../../src/app/mocks/events.mock';
import {GAME_INFORMATION} from '../../../../../../../src/app/mocks/information.mock';

@Component({
  selector: 'kypo2-viz-hurdling',
  templateUrl: './game-analysis.component.html',
  styleUrls: ['./game-analysis.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GameAnalysisComponent implements OnInit, OnChanges {
  @Input() eventService: GameAnalysisEventService;
  @Input() csvFile: File;
  @Input() hideCSVUpload: boolean;
  @Input() colorScheme: string[];

  public assetsRoot: string = environment.assetsRoot;
  private d3: D3;
  private activeDataSource: DataSource = DataSource.api;
  private wrapperWidth: number;
  private wrapperHeight: number;
  private width: number;
  private height: number;
  private padding: Padding;
  private bounds: any;
  private xScale: ScaleLinear<number, number>;
  private yScale: ScaleBand<string>;
  private xAxis: Axis <|number|{valueOf(): number}>;
  private chart: any;
  private plan: any;
  private gameChartWrapper: any;
  private gameChart: any;
  private outerWrapper: any;
  private planDomain: number;
  private gameDomain: number;
  private planSegments: any;
  private boundSegments: any;
  private tooltip: any;
  private timeline: any;
  private gamedataset: GenericObject[] = [];
  private plandataset: GenericObject[] = [];
  private levels: string[];
  private levelsTimePlan: number[];
  private loadTimer: any;
  private types: string[];

  // zooming
  private panValue = 0;
  private zoomValue = 1;
  private view: View = View.overview;

  public time = 0;

  public sortType = 'name';
  public sortReverse = false;
  public sortLevel = 0;
  public levelSortOptions: GenericObject[] = [];

  public viewOptions: GenericObject[] = [
    {
      id: 1,
      name: 'Progress'
    },
    {
      id: 2,
      name: 'Final overview'
    }
  ];
  public selectedViewValue = 2;

  public filterOptions: GenericObject[] = [
    {
      id: 1,
      name: 'All'
    },
    {
      id: 2,
      name: 'Game finished'
    },
    {
      id: 3,
      name: 'Game not finished'
    }
  ];
  public selectedFilterValue = 1;

  public csvFilename: string = null;

  public hasData = false;
  public errorMessage: string = null;

  public legendIcons;

  public clickedArray = [];

  @ViewChild('csvInput')
  csvInput: any;

  constructor(
    private config: AppConfig,
    d3Service: D3Service,
    private loadDataService: LoadDataService,
    private loadCsvDataService: LoadCsvDataService,
    private sortingService: SortingService,
    private filteringService: FilteringService,
    private http: HttpClient
  ) {
    this.d3 = d3Service.getD3();
  }

  ngOnChanges(): void {
    this.loadData();
  }

  ngOnInit(): void {
    this.selectedViewValue = this.config.defaultView;
    this.view = this.config.defaultView;
    this.loadData();
    this.legendIcons = [];
    this.legendIcons.push({
      label: 'Solution displayed',
      path: this.config.eventShapePaths.solution
    });
    this.legendIcons.push({
      label: 'Skip',
      path: this.config.eventShapePaths.skip
    });
    this.legendIcons.push({
      label: 'Hint',
      path: this.config.eventShapePaths.hint
    });
    this.legendIcons.push({
      label: 'Wrong',
      path: this.config.eventShapePaths.wrong
    });
  }

  loadData() {
    this.errorMessage = null;

    if (this.csvFile === null || typeof this.csvFile === 'undefined') {
        const data = this.loadDataService.getGameAndPlanMock(GAME_INFORMATION, EVENTS, this.config.levelsTimePlan);
        this.gamedataset = data.gameDataset;
        this.plandataset = data.planDataset;
        this.levels = data.levels;
        this.levelsTimePlan = data.levelsTimePlan;
        this.time = data.time;
        this.types = data.types;
        this.drawChart();

    } else {
      this.loadMock(this.csvFile);
    }

     /*this.loadDataService
       .getGameAndPlanData(
         this.config.token,
         this.config.apiUrl,
         this.config.definitionId,
         this.config.gameId,
         this.config.levelsTimePlan
       )
       .subscribe(
         (data: Data) => {
           this.gamedataset = data.gameDataset;
           this.plandataset = data.planDataset;
           this.levels = data.levels;
           this.levelsTimePlan = data.levelsTimePlan;
           this.time = data.time;
           this.drawChart();
         },
         (error: string) => {
           this.errorMessage = error;
         }
       );*/
  }

  loadMock(file, endInPercents: number = 100) { // todo - work with jsons? we need two uploads then
    this.errorMessage = null;
    this.loadCsvDataService
      .getGameAndPlanData(file, this.config.levelsTimePlan, endInPercents)
      .subscribe(
        (data: Data) => {
          this.gamedataset = data.gameDataset;
          this.plandataset = data.planDataset;
          this.levels = data.levels;
          this.levelsTimePlan = data.levelsTimePlan;
          this.time = data.time;
          this.drawChart();
        },
        (error: string) => {
          this.errorMessage = error;
        }
      );
  }

  drawChart(): void {
    const data: PreparedData = this.getPreparedData();
    this.applyData(data.gameDataset, data.planDataset);
    this.pan();
  }

  getPreparedData(): PreparedData {
    const filteredGamedataset = this.filteringService.filter(
      this.gamedataset,
      this.selectedFilterValue
    );
    const sortedGamedataset = this.sortingService.sort(
      filteredGamedataset,
      this.sortReverse,
      this.sortType,
      this.sortLevel,
      this.view,
      this.levels
    );
    const sortedPlandataset = this.getUpdatedPlandataset(sortedGamedataset);
    return { gameDataset: sortedGamedataset, planDataset: sortedPlandataset };
  }

  getUpdatedPlandataset(gamedataset: GenericObject[]): GenericObject[] {
    // create new plan by sorted/filtered teams in gamedataset
    const newPlandataset: GenericObject[] = [],
      levels = this.levels,
      levelsTimePlan = this.levelsTimePlan;
    gamedataset.forEach((d: GenericObject) => {
      const teamData: GenericObject = {
        team: d.team
      };

      let levelIndex = 0;
      levels.forEach(level => {
        const timePlan: number = levelsTimePlan[levelIndex];
        teamData[level] = level !== 'start' ? timePlan : 0;
        if (level !== 'start') levelIndex++;
      });

      newPlandataset.push(teamData);
    });
    return newPlandataset;
  }

  applyData(gamedataset: GenericObject[], plandataset: GenericObject[]): void {
    if (gamedataset.length === 0 || plandataset.length === 0) {
      this.hasData = false;
      return;
    }

    const levelKeys: string[] = this.levels;
    // in final overview align start of all teams - repan start time
    if (this.view === View.overview) {
      const startLevelIndex: number = levelKeys.indexOf('start');
      if (startLevelIndex >= 0) levelKeys.splice(startLevelIndex, 1);
    }

    const gamedata: GameData = {
      time: this.time,
      types: this.types,
      keys: levelKeys,
      teams: gamedataset
    };

    const plandata: PlanData = {
      keys: levelKeys,
      teams: plandataset
    };

    this.levelSortOptions = [];

    const estimatedTime = this.getEstimatedTime();

    this.drawChartBase({
      data: plandata,
      element: 'ctf-progress-chart',
      outerWrapperElement: 'ctf-progress-wrapper',
      time: 0,
      padding: {
        top: 10,
        bottom: 40
      },
      minBarHeight: this.config.minBarHeight,
      maxBarHeight: this.config.maxBarHeight,
      estimatedTime: estimatedTime
    });

    this.drawPlan({
      data: plandata,
      time: 0,
      estimatedTime: estimatedTime
    });

    this.drawGame({
      data: gamedata,
      eventShapePaths: this.config.eventShapePaths,
      currentLevelColor: this.config.darkColor,
      time: gamedata.time
    });

    const dataColumns = {
      team: 'ctf-progress-teamcolumn',
      time: 'ctf-progress-timecolumn'
    };

    this.addDataColumns(dataColumns, gamedata);

    this.hasData = true;
  }

  getEstimatedTime(): number {
    const levelsTimePlanSum = this.levelsTimePlan.reduce((a, b) => {
      return a + b;
    }, 0);
    return this.view === View.progress
      ? levelsTimePlanSum * 1.25
      : levelsTimePlanSum;
  }

  drawChartBase(baseConfig: BaseConfig): void {
    const d3: D3 = this.d3,
      element: string = baseConfig.element,
      plandata: PlanData = baseConfig.data,
      padding: Padding = baseConfig.padding,
      estimatedTime: number = baseConfig.estimatedTime,
      stack = d3
        .stack()
        .keys(plandata.keys)
        .offset(d3.stackOffsetNone),
      layers = stack(plandata.teams);
    this.time = baseConfig.time;
    this.padding = padding;

    // clear wrapper content
    d3.select('#' + element).html('');
    this.outerWrapper = d3.select('.' + baseConfig.outerWrapperElement);
    // create svg
    // calculate the height first, width can change when the scrollbar is added
    this.wrapperWidth = Math.max(document.getElementById(element).getBoundingClientRect().width, // original (standalone) size
                        window.innerWidth / 2 - (window.innerWidth / 2 * 0.25)); // get width in the dashboard as a 75% piece of a halfpage
    const maxHeight: number = Math.min(
      this.wrapperWidth * 0.7,
      window.innerHeight - 130,
      baseConfig.maxBarHeight * plandata.teams.length
    );
    const minHeight: number =
      baseConfig.minBarHeight * plandata.teams.length + 80;
    this.wrapperHeight = Math.max(maxHeight, minHeight);

    this.chart = d3
      .select('#' + element)
      .append('svg')
      .attr('class', 'ctf-progress-chart')
      .attr('height', this.wrapperHeight)
      .attr('width', this.wrapperWidth)
      .attr('transform', 'translate(0, ' + padding.top + ')');

    this.width = this.wrapperWidth * this.zoomValue;
    this.height = this.wrapperHeight - padding.top - padding.bottom;

    this.planDomain = Math.max(
      estimatedTime,
      d3.max(
        layers[layers.length - 1],
        (d: number[]): number => {
          return d[1];
        }
      )
    );

    this.initializeScales(plandata);
    this.createAxis(estimatedTime);
  }

  initializeScales(plandata) {
    // init x and y scales
    let yScalePadding: number;
    if (this.wrapperHeight > 550) yScalePadding = 0.02;
    else yScalePadding = 0.05;

    const yDomain = plandata.teams.map(
      (d: GenericObject): string => {
        return d.team;
      }
    );

    this.xScale = this.d3.scaleLinear().rangeRound([0, this.width]); ////here!
    this.xScale.domain([0, this.planDomain]);
    this.yScale = this.d3
      .scaleBand()
      .rangeRound([this.height, 0])
      .padding(yScalePadding);
    this.yScale.domain(yDomain);
  }

  createAxis(estimatedTime) {
    this.xAxis = this.d3
      .axisBottom(this.xScale)
      .tickFormat(d => this.getXAxisTickFormat(d))
      .tickSize(5)
      .tickValues(this.d3.range(0, estimatedTime, this.getXAxisTickInterval()));

    this.gameChartWrapper = this.chart
      .append('g')
      .attr('class', (this.view === View.overview ? 'ctf-game-overview' : 'ctf-game-progress'))
    this.gameChart = this.gameChartWrapper
      .append('g')
      .attr('class', 'ctf-game');

    // append x axis
    this.gameChart
      .append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', 'translate(0,' + (this.height + 10) + ')')
      .call(this.xAxis);
  }

  getXAxisTickFormat(data: any): string {
    return this.wrapperWidth > 650
      ? this.getTimeString(data)
      : this.getTimeString(data).substring(0, 5);
  }

  getXAxisTickInterval(): number {
    const interval: number = this.wrapperWidth > 500 ? 900 : 2000;
    return Math.floor(interval / Math.floor(this.zoomValue));
  }

  drawPlan(planConfig: PlanConfig): void {
    const d3: D3 = this.d3,
      plandata: PlanData = planConfig.data,
      getPlanColor = this.getPlanColor.bind(this),
      stack = d3
        .stack()
        .keys(plandata.keys)
        .offset(d3.stackOffsetNone),
      layers = stack(plandata.teams);

    this.plan = this.gameChart.append('g').attr('class', 'plan');

    this.createPattern(plandata);
    const planLayers = this.createPlanLayersAndReturnThem(layers);
    this.createPlanSegments(planLayers);
    this.createBoundingLines(layers);
  }

  createPattern(plandata) {
    const defs = this.plan.append('defs');
    const pattern = defs
      .selectAll('pattern')
      .data(plandata.keys)
      .enter()
      .append('pattern')
      .attr('id', (d: GenericObject, i: string): string => 'diagonalHatch' + i)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', '7')
      .attr('height', '4')
      .attr('patternTransform', 'rotate(45)');
    pattern
      .append('rect')
      .attr('width', '3')
      .attr('height', '4')
      .attr('transform', 'translate(0,0)')
      .attr(
        'fill',
        (r: GenericObject, i: string): string => this.getPlanColor(+i)
      )
      .attr('opacity', '0.5');
  }

  createPlanLayersAndReturnThem(layers) {
    return this.plan
      .selectAll('.plan-layer')
      .data(layers)
      .enter()
      .append('g')
      .attr('class', 'plan-layer')
      .style(
        'fill',
        (d: GenericObject, i: string): string => 'url(#diagonalHatch' + i + ')'
      );
  }

  createPlanSegments(planLayers) {
    // draw segment (row in column) for each team
    this.planSegments = planLayers
      .selectAll('.plan-segment')
      .data((d: GenericObject): GenericObject => d)
      .enter()
      .append('rect')
      .attr('y', (d: GenericObject): number => this.yScale(String(d.data.team)))
      .attr('x', (d: GenericObject): number => this.xScale(d[0]))
      .attr('height', this.yScale.bandwidth())
      .attr(
        'width',
        (d: GenericObject): number => this.xScale(d[1]) - this.xScale(d[0])
      );
  }

  createBoundingLines(layers) {
    // draw bounding lines for each team
    const boundWidth = 2;
    this.bounds = this.gameChart.append('g').attr('class', 'bounds');
    if (this.view === View.overview) {
      const boundGroups = this.bounds
        .selectAll('.bounds-layer')
        .data(layers)
        .enter()
        .append('g')
        .attr('class', 'bounds-layer')
        .style(
          'fill',
          (d: GenericObject, i: string): string => {
            return this.getPlanColor(+i);
          }
        );

      this.boundSegments = boundGroups
        .selectAll('rect.plan-bound')
        .data((d: GenericObject): GenericObject => d)
        .enter()
        .append('rect')
        .attr(
          'y',
          (d: GenericObject): number => this.yScale(String(d.data.team))
        )
        .attr(
          'x',
          (d: GenericObject): string =>
            (<number>this.xScale(d[1]) - boundWidth).toString()
        )
        .attr('height', this.yScale.bandwidth())
        .attr('width', boundWidth);
    }
  }

  drawGame(gameConfig: GameConfig): void {
    const d3: D3 = this.d3,
      gamedata: GameData = gameConfig.data,
      currentLevelColor: string = gameConfig.currentLevelColor,
      eventShapePaths = gameConfig.eventShapePaths,
      getColor = this.getColor.bind(this),
      getLightenedColor = this.getLightenedColor.bind(this),
      stack = d3
        .stack()
        .keys(gamedata.keys)
        .offset(d3.stackOffsetNone),
      layers = stack(gamedata.teams),  // !!
      view = this.view,
      outerWrapper = this.outerWrapper,
      sortLevel = this.sortLevel,
      getPanValue = () => {
        return this.panValue;
      };

    this.time = gameConfig.time;

    this.gameDomain = Math.max(
      this.time,
      d3.max(
        layers[layers.length - 1],
        (d: number[]): number => d['data'].totalTime
      )
    );

    if (!isNaN(this.gameDomain)) {
      this.xScale.domain([0, Math.max(this.planDomain, this.gameDomain)]);
    }

    this.updateXAxis();
    const layer = this.createColumnForEachLevel(layers);

    // draw segment (row in column) for each team
    this.createSegmentForEachTeam({
      layer: layer,
      gamedata: gamedata,
      layers: layers,
      view: view
    });

    // update plan according to actual data
    this.updatePlan(gamedata);

    // tooltip for events
    this.createEventTooltips();

    const eventIconWidth = 17,
      groupCircleWidth = 18;

    // group events
    this.groupEvents({ gamedata: gamedata, eventIconWidth: eventIconWidth });

    this.createEvents({
      gamedata: gamedata,
      eventShapePaths: eventShapePaths,
      currentLevelColor: currentLevelColor,
      groupCircleWidth: groupCircleWidth,
      eventIconWidth: eventIconWidth
    });

    // pan bounds to top
    this.bounds.raise();

    // append time axis
    this.createTimeline();

    // add labels to header above the bounds, for sorting by level time
    this.createSortingLabels(gamedata);
  }

  updateXAxis() {
    this.xAxis = this.d3
      .axisBottom(this.xScale)
      .tickFormat((d: any) => this.getXAxisTickFormat(d))
      .tickSize(5)
      .tickValues(this.d3.range(0, this.time, this.getXAxisTickInterval()));
    this.d3.select('.axis.axis-x').call(this.xAxis);
  }

  createColumnForEachLevel(layers) {
    const game = this.gameChart.append('g').attr('class', 'game');
    const layer = game
      .selectAll('.game-layer')
      .data(layers)
      .enter()
      .append('g')
      .attr('class', 'game-layer')
      .attr(
        'fill',
        (d: GenericObject, i: string): string => {
          return this.getColor(+i);
        }
      );
    return layer;
  }

  createSegmentForEachTeam({ layer, gamedata, layers, view }) {
    const xScale: ScaleLinear<number, number> = this.xScale;
    const yScale: ScaleBand<string> = this.yScale;
    const time: number = this.time;
    layer
      .selectAll('rect.game-segment')
      .data((d: GenericObject): GenericObject => d)
      .enter()
      .append('rect')
      .attr('y', (d: GenericObject): number => this.yScale(d.data.team))
      .attr(
        'x',
        (d: GenericObject, i: number): number => {
          const x: number = d[0];
          // when sorting by level, align the teams by this level
          if (this.view === View.overview && this.sortType === 'level') {
            if (typeof gamedata.teams[i].offsets === 'undefined') {
              gamedata.teams[i].offsets = [];
            }
            if (
              typeof gamedata.teams[i].offsets[this.sortLevel] === 'undefined'
            ) {
              if (typeof this.sortLevel === 'undefined') {
                // gamedata.teams[i].offsets[this.sortLevel] = 0;
              } else {
                const levelsTimePlanSum = this.levelsTimePlan
                  .slice(0, this.sortLevel - 1)
                  .reduce((a, b) => a + b, 0);
                const levelBound = levelsTimePlanSum,
                  teamLevelStart = layers[this.sortLevel - 1][i][0],
                  teamOffset = levelBound - teamLevelStart;
                gamedata.teams[i].offsets[this.sortLevel] = teamOffset;
              }
            }
            return (
              this.xScale(x) +
              this.xScale(gamedata.teams[i].offsets[this.sortLevel])
            );
          } else {
            return this.xScale(x);
          }
        }
      )
      .attr('height', this.yScale.bandwidth())
      .attr('width', (d: GenericObject, i: number, nodes) => {
        const level: GenericObject = <GenericObject>(
            this.d3.select(nodes[i].parentNode).datum()
          ),
          levelIndex: number = level.index,
          levelKey: string =
            view === View.overview
              ? 'level' + (levelIndex + 1)
              : 'level' + levelIndex,
          teamIndex: number = i,
          data: NumericObject = layers[levelIndex][teamIndex]['data'],
          currentLevelData: number =
            layers[levelIndex][teamIndex]['data'][levelKey],
          currentState: string = data['currentState'];

          let allNodes = this.d3
              .select(nodes[i]);

          allNodes.classed('preserved', (data: any) => (this.clickedArray.includes(data.data.team)))
              .classed('faded', (data: any) => (this.clickedArray.length > 0 && !this.clickedArray.includes(data.data.team)));
          if (typeof currentLevelData === 'undefined' || this.view === View.overview) {
              allNodes.classed('game-segment-finished', true);
          }

          if (typeof currentLevelData !== 'undefined') {
            return xScale(d[1]) - xScale(d[0]);
          } else if (currentState === levelKey) {
            if (this.view === View.overview) {
                return xScale(time) - xScale(d[0]) - xScale(d.data['start']);
            } else return xScale(time) - xScale(d[0]);
          } else {
            return 0;
          }

      })
      .on('mouseover', (d: GenericObject, teamIndex: number) => {
        // highlight team on hover
        this.outerWrapper.classed('ctf-progress-hover', true);
        this.d3
          .selectAll('.data text')
          .filter((data: any) => data.team === d.data.team)
          .classed('data-hover', true);
        this.d3
            .selectAll('.game .game-layer rect')
            .filter((data: any) => data.data.team === d.data.team)
            .classed('data-hover', true);

          if (this.eventService) {
          this.eventService.gameAnalysisOnBarMouseover(+d.data.team);
        }
      })
      .on('mouseout', (d: GenericObject, teamIndex: number) => {
        // remove team highlighting
        if (this.clickedArray.length === 0)
          this.outerWrapper.classed('ctf-progress-hover', false);
        this.d3
          .selectAll('.data text')
          .filter((data: any) => !this.clickedArray.includes(data.team))
          .classed('data-hover', false);
        this.d3
            .selectAll('.game .game-layer rect')
            .filter((data: any) => data.data.team === d.data.team)
            .classed('data-hover', false);
        if (this.eventService) {
          this.eventService.gameAnalysisOnBarMouseout(+d.data.team);
        }
      })
      .on('click', (d, teamIndex) => {
        if (this.clickedArray.includes(d.data.team)) {
          this.clickedArray = this.clickedArray.filter(
            item => item !== d.data.team
          );
        } else {
          this.clickedArray.push(d.data.team);
        }
        if (this.eventService) {
          this.eventService.gameAnalysisOnBarClick(+d.data.team);
        }
        this.outerWrapper.classed('ctf-progress-hover', true);
        this.d3
          .selectAll('.data text')
          .filter((data: any) => data.team === d.data.team)
          .classed('data-hover', true);
        this.d3
            .selectAll('.game .game-layer rect')
            .filter((data: any) => data.data.team === d.data.team)
            .classed('preserved', (data: any) => (this.clickedArray.includes(data.data.team)))
        if (this.view === View.overview) { // in progress view we want to keep the unfinished levels highlighted
            this.d3
                .selectAll('.game .game-layer rect')
                .classed('faded', ((data: any) => (this.clickedArray.length > 0) ? true : false));
        }
      });
  }

  updatePlan(gamedata: GameData): void {
    const d3: D3 = this.d3,
      offset: number[] = [],
      xScale: ScaleLinear<number, number> = this.xScale,
      stack = d3
        .stack()
        .keys(gamedata.keys)
        .offset(d3.stackOffsetNone),
      layers = stack(gamedata.teams),
      view = this.view;

    // pan plan to top
    this.plan.raise();

    this.planSegments
      .attr(
        'opacity',
        (d: GenericObject, i: number, nodes): number => {
          const level: GenericObject = <GenericObject>(
              d3.select(nodes[i].parentNode).datum()
            ),
            levelIndex: number = level.index,
            levelKey: string =
              view === View.overview
                ? 'level' + (levelIndex + 1)
                : 'level' + levelIndex,
            teamIndex: number = i,
            data: NumericObject = layers[levelIndex][teamIndex]['data'],
            currentState: string = data['currentState'];
          return (currentState === levelKey && view !== View.overview) ? 1 : 0;
        }
      )
      .attr(
        'x',
        (d: any, i: number, nodes): number => {
          const level: GenericObject = <GenericObject>(
              d3.select(nodes[i].parentNode).datum()
            ),
            levelIndex: number = level.index,
            teamIndex: number = i,
            currentData: NumericObject = layers[levelIndex][teamIndex],
            isCurrentLevel: boolean = isNaN(currentData[1]);
          let x: number = d[0];

          if (isCurrentLevel) {
            offset[teamIndex] = currentData[0] - d[0];
          }

          if (offset[teamIndex] !== undefined) {
            let xShifted = x + offset[teamIndex];
            // if next level should start in past, must be shifted to present (as same as all next level)
            if (!isCurrentLevel && xShifted < this.time) {
              offset[teamIndex] += this.time - xShifted;
              xShifted = this.time;
            }
            x = xShifted;
          }
          return xScale(Math.max(1, x));
        }
      )
      .attr(
        'width',
        (d: GenericObject): number =>
          // rescale to new x domain
          this.xScale(d[1]) - this.xScale(d[0])
      )
      .style(
        'transform',
        (d: GenericObject, i: number): string => {
          let teamOffset = 0;
          if (
            typeof gamedata.teams[i].offsets !== 'undefined' &&
            typeof gamedata.teams[i].offsets[this.sortLevel] !== 'undefined'
          ) {
            teamOffset = gamedata.teams[i].offsets[this.sortLevel];
          }
          return 'translateX(' + xScale(teamOffset) + 'px)';
        }
      );

    // rescale bounds (xScale could change)
    if (this.view === View.overview) {
      this.boundSegments.attr(
        'x',
        (d: GenericObject): number => this.xScale(d[1])
      );
    }
  }

  createEventTooltips() {
    if (typeof this.tooltip !== 'undefined') this.tooltip.remove();

    const tooltip: any = this.d3
      .select('#ctf-progress-chart')
      .append('div')
      .attr('class', 'ctf-progress-tooltip')
      .style('opacity', 0);
    this.tooltip = tooltip;
  }

  groupEvents({ gamedata, eventIconWidth }) {
    const eventsDataset: GenericObject[] = gamedata.teams.slice(0);
    eventsDataset.forEach(team => {
      const eventsGroups: GenericObject[] = [];
      if (Array.isArray(team.events) && team.events.length > 0) {
        const first: any = team.events[0],
          lastIndex: number = team.events.length - 1;
        let previousEvent: any = null,
          group: any = {
            events: [],
            level: first.game_details.level_number
          },
          previousOffset = false,
          isDuplicated = false;
        team.events.forEach((event, index) => {
          if (previousEvent != null) {
            const levelX: number = this.xScale(team['level' + event.game_details.level_number]),
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
              event.name === previousEvent.name &&
              event.timestamp === previousEvent.timestamp &&
              event.game_details.level_number === previousEvent.game_details.level_number;

            if (diff > 7 || event.game_details.level_number !== previousEvent.game_details.level_number) {
              const groupCopy: any = Object.assign({}, group);
              eventsGroups.push(groupCopy);
              group = {
                events: [],
                level: event.game_details.level_number
              };
            }
          }

          if (this.xScale(event.timestamp) < eventIconWidth / 2) {
            previousOffset = true;
          } else {
            previousOffset = false;
          }

          // don't push duplicated events
          if (!isDuplicated) {
            group.events.push(event);
          }
          previousEvent = event;

          if (index === lastIndex) {
            const groupCopy: any = Object.assign({}, group);
            eventsGroups.push(groupCopy);
          }
        });
      }

      eventsGroups.forEach((group, index) => {
        const events = group.events,
          groupLevelX: number = this.xScale(team['level' + group.level]),
          firstGroupEvent: any = events[0],
          lastGroupEvent: any = events[events.length - 1],
          firstX: number = this.xScale(firstGroupEvent.game_details.logical_time),
          lastX: number = this.xScale(lastGroupEvent.game_details.logical_time);
        /*if(team.team === 'Participant1') {
            console.log(group.level);
            console.log(firstGroupEvent.game_details);
            console.log(firstX);
            console.log(lastX);
            console.log(groupLevelX);
        }*/
        let x: number;
        if (firstX === lastX) x = firstX;
        else x = firstX + (lastX - firstX) / 2;

        if (this.view === View.progress) x += this.xScale(team['start']);
        if (x < eventIconWidth / 2 || groupLevelX < eventIconWidth * 2) {
          x += eventIconWidth / 2;
        }
        if (typeof groupLevelX !== 'undefined' &&
          groupLevelX - x < eventIconWidth / 2) {
          x -= eventIconWidth / 2;
        }
          group['x'] = x;
      });

      team.eventsGroups = eventsGroups;
    });
  }

  createEvents({
    gamedata,
    eventShapePaths,
    currentLevelColor,
    groupCircleWidth,
    eventIconWidth
  }) {
    const d3 = this.d3;
    const eventsLayer: any = this.gameChart.append('g').attr('class', 'events');

    const eventLayers: any = eventsLayer
      .selectAll('g.events-row')
      .data(gamedata.teams)
      .enter()
      .append('g')
      .attr('class', 'events-row')
      .style(
        'transform',
        (d: GenericObject, i: number): string => {
          let teamOffset = 0;
          if (
            typeof gamedata.teams[i].offsets !== 'undefined' &&
            typeof gamedata.teams[i].offsets[this.sortLevel] !== 'undefined'
          ) {
            teamOffset = gamedata.teams[i].offsets[this.sortLevel];
          }
          return 'translateX(' + this.xScale(teamOffset) + 'px)';
        }
      )
      .attr('data-index', (d: GenericObject, i: number): number => i)
      .on('mouseover', (d: any, teamIndex: number) => {
        // preserve teamhighlight
        this.outerWrapper.classed('ctf-progress-hover', true);
        d3.selectAll('.data text:nth-child(' + (teamIndex + 1) + ')').classed(
          'data-hover',
          true
        );
      })
      .on('mouseout', (d: any, teamIndex: number) => {
        if (this.clickedArray.length > 0) return;
        this.outerWrapper.classed('ctf-progress-hover', false);
        d3.selectAll('.data text:nth-child(' + (teamIndex + 1) + ')').classed(
          'data-hover',
          false
        );
      });

    const eventsGroups: any = eventLayers
      .selectAll('path.event')
      .data((d: GenericObject): Event[] => d.eventsGroups)
      .enter()
      .append('path')
      .attr('class', 'event')
      .attr(
        'd',
        (group: GenericObject): string => {
          if (group.events.length === 1) {
            const event: any = group.events[0];
            return eventShapePaths[event.type];
          } else {
            return eventShapePaths['group'];
          }
        }
      )
      .attr(
        'fill',
        (d: GenericObject, i, nodes): string => {
          const teamStruct: DataEntry = <DataEntry>(
            d3.select(nodes[i].parentNode).datum()
          );
          let colorIndex: number = +d.level;
          if (this.view === View.overview) colorIndex -= 1; // in final overview is no first transparent column for start
          // check if the event is in current unfinished level
          return (teamStruct['currentState'] === 'level' + d.level && this.view === View.progress)
            ? currentLevelColor
            : (this.view !== View.overview ? this.getColor(colorIndex) : this.getPlanColor(colorIndex));
        }
      )
      .attr(
        'stroke',
        (d: GenericObject, i, nodes): string => {
          const teamStruct: DataEntry = <DataEntry>(
            d3.select(nodes[i].parentNode).datum()
          );
          let colorIndex: number = +d.level;
          if (this.view === View.overview) colorIndex -= 1; // in final overview is no first transparent column for start
          // check if the event is in current unfinished level
          return teamStruct['currentState'] === 'level' + d.level
            ? this.getColor(colorIndex)
            : this.getLightenedColor(colorIndex);
        }
      )
      .attr(
        'transform',
        (group: GenericObject, i: number, nodes): string => {
          // event absolute time from game start
          const iconWidth: number =
            group.events.length > 1 ? groupCircleWidth : eventIconWidth;
          const teamStruct: DataEntry = <DataEntry>(
              d3.select(nodes[i].parentNode).datum()
            ),
            y =
              this.yScale(teamStruct.team) +
              this.yScale.bandwidth() * 0.5 -
              iconWidth / 2;
          const levelEnd: number = teamStruct['level' + group.level];
          const x = group.x - iconWidth / 2;
          return 'translate(' + x + ',' + y + ')';
        }
      )
      .on('mouseover', (d: any, i: number, nodes) => {
        this.tooltip
          .transition()
          .duration(200)
          .style('opacity', 0.9);
        const teamNode = d3.select(nodes[i].parentNode),
          teamStruct: DataEntry = <DataEntry>teamNode.datum(),
          y = this.yScale(teamStruct.team) + this.yScale.bandwidth() * 0.5 + 3;
        let teamOffset = 0;
        const teamIndex: string = teamNode.attr('data-index');
        if (
          typeof gamedata.teams[teamIndex].offsets !== 'undefined' &&
          typeof gamedata.teams[teamIndex].offsets[this.sortLevel] !==
            'undefined'
        ) {
          teamOffset = gamedata.teams[teamIndex].offsets[this.sortLevel];
        }
        const x = d.x + 2 + this.panValue + this.xScale(teamOffset);
        this.tooltip
          .html(
            (): string => {
              let text = '';
              d.events.forEach((event, index) => {
                const item = [];
                item.push(
                  '<span class="ctf-progress-tooltip-item">',
                  '<svg width="14" height="14" viewbox="0 0 16 16">',
                  '<path d="' + eventShapePaths[event.type] + '"/>',
                  '</svg>',
                  event.name,
                  '</span>'
                );
                text += item.join('');
              });
              return text;
            }
          )
          .style('left', x + 'px')
          .style('top', y + 'px');
      })
      .on('mouseout', (d: any) => {
        this.tooltip
          .transition()
          .duration(500)
          .style('opacity', 0);
      });

    const eventsGroupsText: any = eventLayers
      .selectAll('text.event-number')
      .data((d: GenericObject): Event[] => d.eventsGroups)
      .enter()
      .append('text')
      .filter(group => group.events.length > 1)
      .attr('class', 'event-number')
      .attr(
        'y',
        (d: GenericObject, i: number, nodes): string => {
          const teamStruct: DataEntry = <DataEntry>(
              d3.select(nodes[i].parentNode).datum()
            ),
            y =
              this.yScale(teamStruct.team) +
              this.yScale.bandwidth() * 0.5 +
              groupCircleWidth / 5;
          return y.toString();
        }
      )
      .attr(
        'x',
        (group: GenericObject, i: number): string => {
          return group.x.toString();
        }
      )
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .text((group): string => group.events.length.toString());
  }

  createTimeline() {
    if (this.view === View.progress) {
      this.timeline = this.gameChart
        .append('line')
        .attr('class', 'timeline')
        .attr('x1', this.xScale(this.time) - 2)
        .attr('y1', 0)
        .attr('x2', this.xScale(this.time) - 2)
        .attr('y2', this.height)
        .attr('stroke-width', 3);
    }
  }

  createSortingLabels(gamedata) {
    if (this.view === View.overview && gamedata['teams'].length) {
      gamedata['keys'].forEach(
        (levelKey: string, index: number): void => {
          // let levelTime: number = this.levelTimePlan;
          const levelsTimePlanSum = this.levelsTimePlan
            .slice(0, index + 1)
            .reduce((a, b) => a + b, 0);
          const x: number = this.xScale(levelsTimePlanSum);

          let sortLevelName: string;
          if (this.types[index] === 'info') {
            sortLevelName = this.wrapperWidth > 530 ? 'Info' : 'I';
          }
          if (this.types[index] === 'assessment') {
            sortLevelName = this.wrapperWidth > 530 ? 'Q' : 'Q';
          }
          if (this.types[index] === 'game') {
            let levelNum = 0;
            for (let i = 0; i <= index; i++) {
              if (this.types[i] === 'game') { levelNum++; }
            }
            sortLevelName = this.wrapperWidth > 530 ? 'Level ' + levelNum : 'L' + levelNum;
          }
          this.levelSortOptions.push({
            index: index + 1,
            key: levelKey,
            name: sortLevelName,
            x: x + 'px',
            translate: 'translate(calc(-50% + 15px), 0)'
          });
        }
      );
    }
  }

  addDataColumns(dataColumns: GenericObject, gamedata: GameData) {
    const d3: D3 = this.d3;

    // append columns with data (team, time, score)
    d3.select('#' + dataColumns['time']).html('');
    d3.select('#' + dataColumns['team']).html('');

    const teamData: any = d3
      .select('#' + dataColumns['team'])
      .append('svg')
      .attr('height', this.wrapperHeight);
    const teamDataLayer: any = teamData.append('g').attr('class', 'data');

    const teams: any = teamDataLayer
      .selectAll('text.data-team')
      .data(gamedata.teams)
      .enter()
      .append('text')
      .text((d: GenericObject): string => d.team)
      .attr(
        'y',
        (d: GenericObject): number =>
          this.yScale(d.team) + this.yScale.bandwidth() * 0.6 + this.padding.top
      )
      .attr('x', 130)
      .style('text-anchor', 'end');

    const timeData: any = d3
      .select('#' + dataColumns['time'])
      .append('svg')
      .attr('height', this.wrapperHeight);
    const timeDataLayer: any = timeData.append('g').attr('class', 'data');

    const times: any = timeDataLayer
      .selectAll('text.data-time')
      .data(gamedata.teams)
      .enter()
      .append('text')
      .text(
        (d: GenericObject): string =>
          !isNaN(d.totalTime) ? this.getTimeString(d.totalTime) : ''
      )
      .attr(
        'y',
        (d: GenericObject): number =>
          this.yScale(d.team) + this.yScale.bandwidth() * 0.6 + this.padding.top
      )
      .attr('x', 0);
  }

  pan(left?: number) {
    if (typeof this.gameChart === 'undefined') {
      return;
    }

    if (typeof left === 'undefined') left = 0;
    let pan: number = this.panValue + left;
    pan = Math.max(-(this.width - this.wrapperWidth), pan);
    pan = Math.min(0, pan);
    this.gameChart.style('transform', 'translate(' + pan + 'px, 0)');

    this.levelSortOptions.forEach(level => {
      level.translate = 'translate(calc(-50% + ' + (pan + 15) + 'px), 0)';
    });
  }

  onCsvFileChange($event): void {
    clearInterval(this.loadTimer);
    if ($event.target.files.length > 0) {
      this.clear();
      if (this.selectedViewValue === 1) {
        this.simulateCSVGameProgress(0, 100, 1, this.config.simulationInterval);
      } else {
        this.loadDataFromCSV();
      }
      this.activeDataSource = DataSource.csv;
      this.csvFilename = this.csvInput.nativeElement.files[0].name;
    } else {
      this.clearCsvFile();
    }
  }

  clearCsvFile(): void {
    this.clear();
    clearInterval(this.loadTimer);
    if (this.selectedViewValue === 1) {
      this.watchGameProgress();
    } else {
      this.loadData();
    }
    this.activeDataSource = DataSource.api;
    this.csvFilename = null;
  }

  onViewValueChange(): void {
    clearInterval(this.loadTimer);
    switch (this.selectedViewValue) {
      case 1:
        this.switchToProgressView();
        break;
      case 2:
        this.switchToFinalOverview();
        break;
    }
  }

  onResize() {
    this.drawChart();
  }

  onMouseWheelUp($event: any) {
    if (this.zoomValue < this.config.maxZoomValue) {
      const newZoomValue = Math.min(
          this.config.maxZoomValue,
          this.zoomValue + this.config.zoomStep
        ),
        scale = newZoomValue / this.zoomValue,
        dx =
          (-$event.left + this.panValue) * scale + $event.left - this.panValue;

      this.zoomValue = newZoomValue;
      this.drawChart();

      // because of team highlighting animation, add class which cancels the animation after zoom
      this.outerWrapper.classed('ctf-progress-zoom', true);
      setTimeout(() => {
        this.outerWrapper.classed('ctf-progress-zoom', false);
      }, 150);

      this.pan(dx);
      this.updatePanValue();
    }
  }

  onMouseWheelDown($event: any) {
    if (this.zoomValue > 1) {
      const newZoomValue = Math.max(1, this.zoomValue - this.config.zoomStep),
        scale = newZoomValue / this.zoomValue,
        dx =
          (-$event.left + this.panValue) * scale + $event.left - this.panValue;

      this.zoomValue = newZoomValue;
      this.drawChart();

      // because of team highlighting animation, add class which cancels the animation after zoom
      this.outerWrapper.classed('ctf-progress-zoom', true);
      setTimeout(() => {
        this.outerWrapper.classed('ctf-progress-zoom', false);
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

  onFilterValueChange(): void {
    this.drawChart();
  }

  onSortValueChange(
    sortType: string,
    sortReverse: boolean,
    levelIndex?: number
  ): void {
    this.sortType = sortType;
    this.sortReverse = sortReverse;
    if (typeof levelIndex !== 'undefined') {
      this.sortLevel = levelIndex;
    } else {
      this.sortLevel = 0;
    }
    this.drawChart();
    if (this.clickedArray.length > 0) {
      this.outerWrapper.classed('ctf-progress-hover', true);
      this.d3
        .selectAll('.data text')
        .filter((data: any) => this.clickedArray.includes(data.team))
        .classed('data-hover', true);
    }
  }

  watchGameProgress() {
    const interval: number = this.config.loadDataInterval;
    this.loadData();
    this.loadTimer = setInterval((): void => {
      this.loadData();
    }, interval);
  }

  loadDataFromCSV(endInPercents: number = 100) {
    const file: File = this.csvInput.nativeElement.files[0];
    this.errorMessage = null;
    this.loadCsvDataService
      .getGameAndPlanData(file, this.config.levelsTimePlan, endInPercents)
      .subscribe(
        (data: Data) => {
          this.gamedataset = data.gameDataset;
          this.plandataset = data.planDataset;
          this.levels = data.levels;
          this.levelsTimePlan = data.levelsTimePlan;
          this.time = data.time;
          this.drawChart();
        },
        (error: string) => {
          this.errorMessage = error;
        }
      );
  }

  simulateCSVGameProgress(
    start: number = 0,
    end: number = 100,
    step: number = 1,
    interval: number = 100
  ): void {
    let currentEnd = start;

    this.loadDataFromCSV(currentEnd);
    this.loadTimer = setInterval((): void => {
      currentEnd += step;
      if (currentEnd > end) {
        clearInterval(this.loadTimer);
        return;
      }
      this.loadDataFromCSV(currentEnd);
    }, interval);
  }

  switchToProgressView() {
    this.zoomValue = 1;
    this.view = View.progress;
    if (this.activeDataSource === DataSource.csv) {
      this.simulateCSVGameProgress(0, 100, 1, this.config.simulationInterval);
    } else {
      this.watchGameProgress();
    }
  }

  switchToFinalOverview() {
    this.view = View.overview;
    if (this.activeDataSource === DataSource.csv) {
      this.loadDataFromCSV();
    } else {
      this.loadData();
    }
  }

  updatePanValue() {
    if (typeof this.gameChart === 'undefined') {
      return;
    }

    const transform: string = this.gameChart.style('transform'),
      translate: string[] = transform
        .substring(transform.indexOf('translate(') + 10, transform.indexOf(')'))
        .split(','),
      xStr: string = translate[0];
    let x: number = parseInt(xStr.substr(0, xStr.length - 2));
    if (!x) x = 0;
    this.panValue = x;
  }

  clear(): void {
    this.d3.select('#ctf-progress-chart').html('');
    this.d3.selectAll('.ctf-progress-column-data').html('');
    this.hasData = false;
  }

  getTimeString(seconds: number): string {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds - hours * 3600) / 60);
    seconds = seconds - hours * 3600 - minutes * 60;

    return (
      hours.toString().padStart(2, '0') +
      ':' +
      minutes.toString().padStart(2, '0') +
      ':' +
      seconds.toString().padStart(2, '0')
    );
  }

  getColor(level: number): string {
    const colors: string[] = (this.colorScheme || this.config.gameColors);
    if (this.view === View.progress) {
      if (level === 0) return 'transparent';
      else level -= 1;
    }
    const colorsCount: number = colors.length;
    return colors[level % colorsCount];
  }

  getPlanColor(level: number): string {
    const colors: string[] = (this.colorScheme || this.config.gameColors);
    if (this.view === View.progress) {
      if (level === 0) return 'transparent';
      else level -= 1;
    }
    const colorsCount: number = colors.length;
    const color = this.d3.hsl(colors[level % colorsCount]);
    return color.darker(1.1).toString();
  }

  getLightenedColor(level: number): string {
    const colors: string[] = (this.colorScheme || this.config.gameColors);
    if (this.view === View.progress) {
      if (level === 0) return 'transparent';
      else level -= 1;
    }
    const colorsCount: number = colors.length;
    const color = this.d3.hsl(colors[level % colorsCount]);
    return color.brighter(0.8).toString();
  }

  /* for analysis manipulation */

  highlightGivenPlayer(playerId: number): void {
      this.outerWrapper.classed('ctf-progress-hover', true);
      this.d3
          .selectAll('.game .game-layer rect')
          .filter((data: any) => data.data.team === playerId.toString())
          .classed('data-hover', true);
  }

  unhighlightGivenPlayer(playerId: number): void {
      this.outerWrapper.classed('ctf-progress-hover', true);
      this.d3
          .selectAll('.game .game-layer rect')
          .filter((data: any) => data.data.team === playerId.toString())
          .classed('data-hover', false);
  }

  preserveHighlightedPlayer(playerId: number): void {
      const player = playerId.toString();
      if (this.clickedArray.includes(player)) {
          this.clickedArray = this.clickedArray.filter(
              item => item !== player
          );
      } else {
          this.clickedArray.push(player);
      }

      this.d3
          .selectAll('.game .game-layer rect')
          .filter((data: any) => data.data.team === player)
          .classed('preserved', (data: any) => (this.clickedArray.includes(data.data.team)));

      if (this.view === View.overview) { // in progress view we want to keep the unfinished levels highlighted
          this.d3
              .selectAll('.game .game-layer rect')
              .classed('faded', ((data: any) => (this.clickedArray.length > 0) ? true : false));
      }
  }
}
