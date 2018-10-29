import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
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

import { Order } from '../../models/order.enum';
import { View } from '../../models/view.enum';
import { DataSource } from '../../models/data-source.enum';

import { GenericObject } from '../../models/generic-object.type';
import { NumericObject } from '../../models/numeric-object.type';

import { environment } from '../../../../environments/environment';
import { SortingService } from '../../services/sorting.service';
import { FilteringService } from '../../services/filtering.service';

@Component({
	selector: 'app-game-analysis',
	templateUrl: './game-analysis.component.html',
	styleUrls: ['./game-analysis.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class GameAnalysisComponent implements OnInit {

	public assetsRoot: string = environment.assetsRoot;
	private config: AppConfig;
	private d3: D3;
	private activeDataSource: DataSource = DataSource.api;
	private loadDataService: LoadDataService;
	private loadCsvDataService: LoadCsvDataService;
	private wrapperWidth: number;
	private wrapperHeight: number;
	private width: number;
	private height: number;
	private padding: Padding;
	private bounds: any;
	private xScale: ScaleLinear<number, number>;
	private yScale: ScaleBand<string>;
	private xAxis: Axis<number | { valueOf(): number }>;
	private yAxis: Axis<string>;
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

	// zooming
	private panValue: number = 0;
	private zoomValue: number = 1;
	private view: View = View.overview;

	public time: number = 0;

	public legendIcons: GenericObject[];

	public sortType: string = 'name';
	public sortReverse: boolean = false;
	public sortLevel: number = 0;
	public levelSortOptions: GenericObject[] = [];

	public viewOptions: GenericObject[] = [
	   { id: 1, name: "Progress" },
	   { id: 2, name: "Final overview" }
	 ];
	public selectedViewValue: number = 2;

	public filterOptions: GenericObject[] = [
	   { id: 1, name: "All" },
	   { id: 2, name: "Game finished" },
	   { id: 3, name: "Game not finished" }
	 ];
	public selectedFilterValue: number = 1;

	public csvFilename: string = null;

	public hasData: boolean = false;
	public errorMessage: string = null;

	@ViewChild('csvInput') csvInput: any;

	constructor(config: AppConfig, d3Service: D3Service, loadDataService: LoadDataService, loadCsvDataService: LoadCsvDataService, private sortingService: SortingService, private filteringService: FilteringService) {
		this.config = config;
		this.d3 = d3Service.getD3();
		this.loadDataService = loadDataService;
		this.loadCsvDataService = loadCsvDataService;
	}

	ngOnInit(): void {
		this.selectedViewValue = this.config.defaultView;
		this.view = this.config.defaultView;
		this.loadData();
	}

	loadData() {
		this.errorMessage = null;
		this.loadDataService.getGameAndPlanData(this.config.apiUrl, this.config.gameId, this.config.levelsTimePlan).subscribe((data: Data) => {
			this.gamedataset = data.gameDataset;
			this.plandataset = data.planDataset;
			this.levels = data.levels;
			this.levelsTimePlan = data.levelsTimePlan;
			this.time = data.time;
			this.drawChart();
		}, (error: string) => {
			this.errorMessage = error;
		});
	}

	drawChart(): void {
		let sortedGamedataset: GenericObject[],
			sortedPlandataset: GenericObject[];
		
		const filteredGamedataset = this.filteringService.filter(this.gamedataset, this.selectedFilterValue);
		sortedGamedataset = this.sortingService.sort(filteredGamedataset, this.sortReverse, this.sortType, this.sortLevel);
		sortedPlandataset = this.updatePlandataset(sortedGamedataset);

		this.applyData(sortedGamedataset, sortedPlandataset);
		this.pan();
	}

	updatePlandataset(gamedataset: GenericObject[]): GenericObject[] {
		// create new plan by sorted/filtered teams in gamedataset
		let newPlandataset: GenericObject[] = [],
			levels = this.levels,
			levelsTimePlan = this.levelsTimePlan;
		gamedataset.forEach(function (d: GenericObject): void {
			let teamData: GenericObject = { team: d.team };
			
			let levelIndex: number = 0;
			levels.forEach(function (level): void {
				let timePlan: number = levelsTimePlan[levelIndex];
				teamData[level] = (level != "start") ? timePlan : 0;
				if(level != "start") levelIndex++;
			});

			newPlandataset.push(teamData);
		});
		return newPlandataset;
	}

	applyData(gamedataset: GenericObject[], plandataset: GenericObject[]): void {
		let darkColor: string = this.config.darkColor,
			eventShapePaths: GenericObject = this.config.eventShapePaths,
			padding: Padding = { top: 10, bottom: 40 };

		if (gamedataset.length === 0 || plandataset.length === 0) {
			this.hasData = false;
			return;
		}

		let levelKeys: string[] = this.levels;
		// in final overview align start of all teams - repan start time
		if(this.view == View.overview) {
			let startLevelIndex: number = levelKeys.indexOf("start");
			if(startLevelIndex >= 0) levelKeys.splice(startLevelIndex, 1);
		}

		this.legendIcons = [];
		this.legendIcons.push({label: 'Solution displayed', path: this.config.eventShapePaths.solution});
		this.legendIcons.push({label: 'Skip', path: this.config.eventShapePaths.skip});
		this.legendIcons.push({label: 'Hint', path: this.config.eventShapePaths.hint});
		
		let gamedata: GameData = {
			"time" : this.time,
			"keys" : levelKeys,
			"teams" : gamedataset
		}

		let plandata: PlanData = {
			"keys" : levelKeys,
			"teams" : plandataset
		}

		let elementId: string = 'ctf-progress-chart',
			outerWrapperId: string = 'ctf-progress-wrapper'; 

		this.levelSortOptions = [];
		let levelsTimePlanSum = this.levelsTimePlan.reduce(function(a, b) { return a + b; }, 0);
		let estimatedTime = (this.view == View.progress) ? levelsTimePlanSum*1.25 : levelsTimePlanSum;

		this.drawChartBase({
			data: plandata,
			element: elementId,
			outerWrapperElement: outerWrapperId,
			time: 0,
			padding: padding,
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
			eventShapePaths: eventShapePaths,
			currentLevelColor: darkColor,
			time: gamedata.time,
		});

		let dataColumns = { "team":  "ctf-progress-teamcolumn", "time" : "ctf-progress-timecolumn"};

		this.addDataColumns(dataColumns, gamedata);

		this.hasData = true;
	}

	drawChartBase(baseConfig: BaseConfig): void {
		let d3: D3 = this.d3,
			element: string = baseConfig.element,
			plandata: PlanData = baseConfig.data,
			padding: Padding = baseConfig.padding,
			estimatedTime: number = baseConfig.estimatedTime,
			stack = d3.stack()
				.keys(plandata.keys)
				.offset(d3.stackOffsetNone),
			layers = stack(plandata.teams);
		this.time = baseConfig.time;
		this.padding = padding;

		// clear wrapper content
		d3.select("#" + element).html("");
		this.outerWrapper = d3.select("." + baseConfig.outerWrapperElement);
		// create svg
		// calculate the height first, width can change when the scrollbar is added
		let wrapperWidth = document.getElementById(element).getBoundingClientRect().width,
			maxHeight: number = Math.min(wrapperWidth*0.7, window.innerHeight-130, baseConfig.maxBarHeight*plandata.teams.length),
			minHeight: number = baseConfig.minBarHeight*plandata.teams.length+80;
		this.wrapperHeight = Math.max(maxHeight, minHeight);
		this.chart = d3.select("#" + element).append("svg").attr("class", "ctf-progress-chart");
		this.chart.attr("height", this.wrapperHeight);

		this.wrapperWidth = document.getElementById(element).getBoundingClientRect().width;
		this.chart.attr("width", this.wrapperWidth)
				.attr("transform", "translate(0, "+padding.top+")");			
		let width: number = (this.wrapperWidth*this.zoomValue),
			height: number = this.wrapperHeight - padding.top - padding.bottom;
		
		this.width = width;
		this.height = height;

		this.planDomain = Math.max(estimatedTime, d3.max(layers[layers.length - 1], function (d: number[]): number { return d[1]; }));

		// init x and y scales
		let yScalePadding: number;
		if(this.wrapperHeight > 550) yScalePadding = 0.02;
		else yScalePadding = 0.05;

		this.xScale = d3.scaleLinear().rangeRound([0, width]);
		this.yScale = d3.scaleBand().rangeRound([height, 0]).padding(yScalePadding);

		// create axis
		this.xAxis = d3.axisBottom(this.xScale)
						.tickFormat(function(d: any) {
							return this.getXAxisTickFormat(d);
						}.bind(this))
						.tickSize(5)
						.tickValues(d3.range(0, estimatedTime, this.getXAxisTickInterval()));
		this.yAxis = d3.axisLeft(this.yScale);

		this.yScale.domain(plandata.teams.map(function(d: GenericObject): string { return d.team; }));
		this.xScale.domain([0, this.planDomain]);
		this.yScale.domain(plandata.teams.map(function (d: GenericObject): string { return d.team; }));

		this.gameChartWrapper = this.chart.append("g")
			.attr("class", "ctf-game-wrapper");
		this.gameChart = this.gameChartWrapper.append("g")
			.attr("class", "ctf-game");

		// append x axis
		this.gameChart.append("g")
			.attr("class", "axis axis-x")
			.attr("transform", "translate(0,"+(this.height+10)+")")
			.call(this.xAxis);
	}

	getXAxisTickInterval(): number {
		let interval: number = (this.wrapperWidth > 500) ? 900 : 2000;
		return Math.floor(interval/Math.floor(this.zoomValue));
	}

	drawPlan(planConfig: PlanConfig): void {
		let d3: D3 = this.d3,
			plandata: PlanData = planConfig.data,
			getPlanColor = this.getPlanColor.bind(this),

			stack = d3.stack()
				.keys(plandata.keys)
				.offset(d3.stackOffsetNone),
			layers = stack(plandata.teams);

		this.plan = this.gameChart.append("g")
			.attr("class", "plan");

		// create hatched pattern defs
		let defs = this.plan.append("defs");
		let pattern = defs.selectAll("pattern")
			.data(plandata.keys)
			.enter().append("pattern")
			.attr("id", function (d: GenericObject, i: string): string { return "diagonalHatch"+i; })
			.attr("patternUnits", "userSpaceOnUse")
			.attr("width", "7")
			.attr("height", "4")
			.attr("patternTransform", "rotate(45)");
		pattern.append("rect")
			.attr("width", "3")
			.attr("height", "4")
			.attr("transform", "translate(0,0)")
			.attr("fill", function (r: GenericObject, i: string): string { return getPlanColor(i); })
			.attr("opacity", "0.5");

		// create column for each level
		let planLayers = this.plan.selectAll(".plan-layer")
			.data(layers)
			.enter().append("g")
			.attr("class", "plan-layer")
			.style("fill", function (d: GenericObject, i: string): string { return "url(#diagonalHatch" + i +")"; });

		// draw segment (row in column) for each team
		this.planSegments = planLayers.selectAll(".plan-segment")
			.data(function (d: GenericObject): GenericObject {return d; })
			.enter().append("rect")
			.attr("y", function (d: GenericObject): string { return this.yScale(String(d.data.team)); }.bind(this))
			.attr("x", function (d: GenericObject): string { return this.xScale(d[0]); }.bind(this))
			.attr("height", this.yScale.bandwidth())
			.attr("width", function (d: GenericObject): number { return this.xScale(d[1]) - this.xScale(d[0]) }.bind(this));

		// draw bounding lines for each team
		let boundWidth: number = 2;
		this.bounds = this.gameChart.append("g")
			.attr("class", "bounds");
		if(this.view == View.overview) {
			let boundGroups = this.bounds.selectAll(".bounds-layer")
				.data(layers)
				.enter().append("g")
				.attr("class", "bounds-layer")
				.style("fill", function (d: GenericObject, i: string): string { return getPlanColor(i); });

			this.boundSegments = boundGroups.selectAll("rect.plan-bound")
				.data(function (d: GenericObject):GenericObject { return d; })
				.enter().append("rect")
				.attr("y", function (d: GenericObject): string { return this.yScale(String(d.data.team)); }.bind(this))
				.attr("x", function (d: GenericObject): string { return (<number>this.xScale(d[1])-boundWidth).toString(); }.bind(this))
				.attr("height", this.yScale.bandwidth())
				.attr("width", boundWidth);
		}
	}

	drawGame(gameConfig: GameConfig): void {
		let d3: D3 = this.d3,
			gamedata: GameData = gameConfig.data,
			currentLevelColor: string = gameConfig.currentLevelColor,
			eventShapePaths = gameConfig.eventShapePaths,
			getColor = this.getColor.bind(this),
			getLightenedColor = this.getLightenedColor.bind(this),
			stack = d3.stack()
				.keys(gamedata.keys)
				.offset(d3.stackOffsetNone),
			layers = stack(gamedata.teams),
			view = this.view,
			outerWrapper = this.outerWrapper,
			sortLevel = this.sortLevel,
			getPanValue = () => { return this.panValue; };

		let eventIconWidth: number = 17,
			groupCircleWidth: number = 18;

		this.time = gameConfig.time;

		this.gameDomain = Math.max(this.time, d3.max(layers[layers.length - 1], function (d: number[]): number { return d["data"].totalTime; }));

		if (!isNaN(this.gameDomain)) {
			this.xScale.domain([0, Math.max(this.planDomain, this.gameDomain)]);
		}

		// update x axis
		this.xAxis = d3.axisBottom(this.xScale)
						.tickFormat(function(d: any) {
							return this.getXAxisTickFormat(d);
						}.bind(this))
						.tickSize(5)
						.tickValues(d3.range(0, this.time, this.getXAxisTickInterval()));
		d3.select(".axis.axis-x")
			.call(this.xAxis);

		// create column for each level
		let game = this.gameChart.append("g")
			.attr("class", "game");
		let layer = game.selectAll(".game-layer")
			.data(layers)
			.enter().append("g")
			.attr("class", "game-layer")
			.attr("fill", function (d: GenericObject, i: string): string { return getColor(i); });

		// draw segment (row in column) for each team
		let xScale: ScaleLinear<number, number> = this.xScale;
		let yScale: ScaleBand<string> = this.yScale;
		let time: number = this.time;
		layer.selectAll("rect.game-segment")
			.data(function (d: GenericObject): GenericObject { return d; })
			.enter().append("rect")
			.attr("y", function (d: GenericObject): string { return this.yScale(d.data.team); }.bind(this))
			.attr("x", function (d: GenericObject, i: number): string {
				let x: number = d[0];
				// when sorting by level, align the teams by this level
				if(this.view == View.overview && this.sortType == "level") {
					if(typeof gamedata.teams[i].offsets === "undefined") {
						gamedata.teams[i].offsets = [];
					}
					if(typeof gamedata.teams[i].offsets[this.sortLevel] === "undefined") {
						if(typeof this.sortLevel === "undefined") {
							gamedata.teams[i].offsets[this.sortLevel] = 0;
						}
						else {
							let levelsTimePlanSum = this.levelsTimePlan.slice(0, this.sortLevel-1).reduce(function(a, b) { return a + b; }, 0);
							let levelBound = levelsTimePlanSum,
							teamLevelStart = layers[this.sortLevel-1][i][0],
							teamOffset = levelBound - teamLevelStart;
							gamedata.teams[i].offsets[this.sortLevel] = teamOffset;
						}
					}
					return (this.xScale(x) + this.xScale(gamedata.teams[i].offsets[this.sortLevel]));
				}
				else {
					return this.xScale(x);
				}
				
			}.bind(this))
			.attr("height", this.yScale.bandwidth())
			.attr("width", function (d: GenericObject, i: number) {
				let level: GenericObject = <GenericObject>d3.select(this.parentNode).datum(),
					levelIndex: number = level.index,
					levelKey: string = (view == View.overview) ? "level" + (levelIndex+1) : "level" + levelIndex,
					teamIndex: number = i,
					data: NumericObject = layers[levelIndex][teamIndex]["data"],
					currentLevelData: number = layers[levelIndex][teamIndex]["data"][levelKey],
					currentState: string = data["currentState"];

				if(typeof currentLevelData !== "undefined") {
					d3.select(this).attr("class", "game-segment-finished")
						.attr("opacity", "0.3");
					return xScale(d[1]) - xScale(d[0]);
				}
				else if(currentState == levelKey) {
					if(view == View.overview) return xScale(time) - xScale(d[0]) - xScale(d.data["start"]);
					else return xScale(time) - xScale(d[0]);
				}
				else {
					return 0;
				}
			})
			.on("mouseover", function(d: GenericObject, teamIndex: number) {
				//highlight team on hover
				outerWrapper.classed("ctf-progress-hover", true);
				d3.selectAll(".data text:nth-child("+(teamIndex+1)+")").classed("data-hover", true);
			})
			.on("mouseout", function(d: GenericObject, teamIndex: number) {
				//remove team highlighting
				outerWrapper.classed("ctf-progress-hover", false);
				d3.selectAll(".data text:nth-child("+(teamIndex+1)+")").classed("data-hover", false);
			});

		// update plan according to actual data
		this.updatePlan(gamedata);

		// tooltip for events
		if(typeof this.tooltip != "undefined") this.tooltip.remove();

		let tooltip: any = d3.select('#ctf-progress-chart')
			.append("div")
			.attr("class", "ctf-progress-tooltip")
			.style("opacity", 0);
		this.tooltip = tooltip;

		//group events
		let eventsDataset: GenericObject[] = gamedata.teams.slice(0);
		eventsDataset.forEach(function(team) {
			let eventsGroups: GenericObject[] = [];
			if(Array.isArray(team.events) && team.events.length > 0) {
				let first: any = team.events[0],
					lastIndex: number = team.events.length-1,
					previousEvent: any = null,
					group: any = { "events": [], "level": first.level },
					previousOffset: boolean = false,
					isDuplicated: boolean = false;
				team.events.forEach(function(event, index) {
					if(previousEvent != null) {
						let levelX: number = xScale(team["level"+event.level]),
							eventX: number = xScale(event.time),
							currentEventX: number = ((levelX-eventX) < eventIconWidth/2) ? eventX -  eventIconWidth/2 : eventX,
							previousEventX: number = (previousOffset) ? xScale(previousEvent.time)+eventIconWidth/2 : xScale(previousEvent.time),
							diff: number = currentEventX - previousEventX;
						isDuplicated = event.name == previousEvent.name && event.time == previousEvent.time &&  event.level == previousEvent.level;

						if((diff > 7) || (event.level != previousEvent.level)) {
							let groupCopy: any = Object.assign({}, group);
							eventsGroups.push(groupCopy);
							group = { "events": [], "level": event.level };
						}
					}

					if(xScale(event.time) < eventIconWidth/2) {
						previousOffset = true;
					}
					else {
						previousOffset = false;
					}

					// don't push duplicated events
					if(!isDuplicated) {
						group.events.push(event);
					}
					previousEvent = event;

					if(index == lastIndex) {
						let groupCopy: any = Object.assign({}, group);
						eventsGroups.push(groupCopy);
					}
				});
			}

			eventsGroups.forEach(function(group, index) {
				let events = group.events,
					groupLevelX: number = xScale(team["level"+group.level]),
					firstGroupEvent: any = events[0],
					lastGroupEvent: any = events[events.length-1],
					firstX: number = xScale(firstGroupEvent.time),
					lastX: number = xScale(lastGroupEvent.time),
					x: number = firstX + ((lastX - firstX)/2);
				if(view == View.progress) x += xScale(team["start"]);
				if(x < eventIconWidth/2) {
					x += eventIconWidth/2;
				}
				if((typeof groupLevelX !== "undefined") && (groupLevelX-x) < eventIconWidth/2) {
					x -= eventIconWidth/2;
				}
				for (var l: number = 1; l < group.level; l++) {
					if(typeof team["level"+l] !== "undefined") {
						x += xScale(team["level"+l]);
					}
				}
				group["x"] = x;
			});

			team.eventsGroups = eventsGroups;
		});

		let eventsLayer: any = this.gameChart.append("g")
			.attr("class", "events");

		let eventLayers: any = eventsLayer.selectAll("g.events-row")
			.data(gamedata.teams)
			.enter().append("g")
			.attr("class", "events-row")
			.style("transform", function (d: GenericObject, i:number): string {
				let teamOffset: number =  0;
				if(typeof gamedata.teams[i].offsets !== "undefined" && typeof gamedata.teams[i].offsets[this.sortLevel] !== "undefined") {
					teamOffset = gamedata.teams[i].offsets[this.sortLevel];
				}
				return "translateX(" + xScale(teamOffset) +"px)";
			}.bind(this))
			.attr("data-index", function(d: GenericObject, i: number): number { return i; })
			.on("mouseover", function(d: any, teamIndex: number) {
				// preserve teamhighlight
				outerWrapper.classed("ctf-progress-hover", true);
				d3.selectAll(".data text:nth-child("+(teamIndex+1)+")").classed("data-hover", true);
			})
			.on("mouseout", function(d: any, teamIndex: number) {
				outerWrapper.classed("ctf-progress-hover", false);
				d3.selectAll(".data text:nth-child("+(teamIndex+1)+")").classed("data-hover", false);
			});

		let eventsGroups: any = eventLayers.selectAll("path.event")
			.data(function (d: GenericObject): Event[] { return d.eventsGroups; })
			.enter().append("path")
			.attr("class", "event")
			.attr("d", function (group: GenericObject): string {
				if(group.events.length == 1) {
					let event: any = group.events[0];
					return eventShapePaths[event.type];
				}
				else {
					return eventShapePaths["group"];
				}
			})
			.attr("fill", function (d: GenericObject): string {
				let teamStruct: DataEntry = <DataEntry>d3.select(this.parentNode).datum();
				let colorIndex: number = +d.level;
				if(view == View.overview) colorIndex -= 1; // in final overview is no first transparent column for start
				// check if the event is in current unfinished level
				return ((teamStruct["currentState"] == "level"+d.level) ? currentLevelColor : getColor(colorIndex.toString()));
			})
			.attr("stroke", function (d: GenericObject): string {
				let teamStruct: DataEntry = <DataEntry>d3.select(this.parentNode).datum();
				let colorIndex: number = +d.level;
				if(view == View.overview) colorIndex -= 1; // in final overview is no first transparent column for start
				// check if the event is in current unfinished level
				return ((teamStruct["currentState"] == "level"+d.level) ? getColor(colorIndex.toString()) : getLightenedColor(colorIndex.toString()));
			})
			.attr("transform", function (group: GenericObject, i:number): string {
				// event absolute time from game start
				let iconWidth: number = (group.events.length > 1) ? groupCircleWidth : eventIconWidth;
				let	teamStruct: DataEntry = <DataEntry>d3.select(this.parentNode).datum(),
					y = (yScale(teamStruct.team) + yScale.bandwidth()*0.5-(iconWidth/2));
				let levelEnd: number = teamStruct['level'+group.level];
				let x = group.x-(iconWidth/2);
				return "translate(" + x + "," + y + ")";
			})
			.on("mouseover", function(d: any, i: number) {
				tooltip.transition()
					.duration(200)
					.style("opacity", 0.9);
				let	teamNode = d3.select(this.parentNode),
					teamStruct: DataEntry = <DataEntry>teamNode.datum(),
					y = (yScale(teamStruct.team) + yScale.bandwidth()*0.5+3);
				let teamOffset: number =  0,
					teamIndex: string = teamNode.attr("data-index");
				if(typeof gamedata.teams[teamIndex].offsets !== "undefined" && typeof gamedata.teams[teamIndex].offsets[sortLevel] !== "undefined") {
					teamOffset = gamedata.teams[teamIndex].offsets[sortLevel];
				}
				let x = d.x+2+getPanValue()+xScale(teamOffset);
				tooltip.html(function (): string {
						let text: string = "";
						d.events.forEach(function(event, index) {
							let item = [];
							item.push(
								'<span class="ctf-progress-tooltip-item">',
								'<svg width="14" height="14" viewbox="0 0 16 16">',
								'<path d="'+eventShapePaths[event.type]+'"/>',
								'</svg>',
								event.name,
								'</span>'
							);
							text += item.join("");
						});
						return text;
					})
					.style("left", x + "px")
					.style("top", y + "px");
			})
			.on("mouseout", function(d: any) {
				tooltip.transition()
				.duration(500)
				.style("opacity", 0);
			});

		let eventsGroupsText: any = eventLayers.selectAll("text.event-number")
			.data(function (d: GenericObject): Event[] { return d.eventsGroups; })
			.enter().append("text")
			.filter(function(group) { return group.events.length > 1; })
			.attr("class", "event-number")
			.attr("y", function (d: GenericObject, i:number): string {
				let	teamStruct: DataEntry = <DataEntry>d3.select(this.parentNode).datum(),
					y = (yScale(teamStruct.team) + yScale.bandwidth()*0.5)+groupCircleWidth/5;
				return y.toString();
			})
			.attr("x", function (group: GenericObject, i:number): string {
				let x = group.x;
				return x.toString();
			})
			.attr("fill", "#fff")
			.attr("font-size", "12px")
			.attr("text-anchor", "middle")
			.text(function(group): string {
				return group.events.length.toString();
			});

		// pan bounds to top
		this.bounds.raise();

		// append time axis
		if(this.view == View.progress) {
			this.timeline = this.gameChart.append("line")
				.attr("class", "timeline")
				.attr("x1", this.xScale(this.time)-2)
				.attr("y1", 0)
				.attr("x2", this.xScale(this.time)-2)
				.attr("y2", this.height)
				.attr("stroke-width", 3);
		}

		// add labels to header above the bounds, for sorting by level time
		if(this.view == View.overview && gamedata["teams"].length) {
			gamedata["keys"].forEach(function (levelKey: string, index: number): void {
				//let levelTime: number = this.levelTimePlan;
				let levelsTimePlanSum = this.levelsTimePlan.slice(0, index+1).reduce(function(a, b) { return a + b; }, 0);
				let x: number = this.xScale(levelsTimePlanSum);

				let sortLevelName: string;
				sortLevelName = (this.wrapperWidth > 530) ? "Level "+(index+1) : "L"+(index+1);
				this.levelSortOptions.push({ index: (index+1), key: levelKey, name: sortLevelName, x: x+"px", translate: "translate(calc(-50% + 15px), 0)" });
			}.bind(this));
		}
	}

	updatePlan(gamedata: GameData): void {
		let d3: D3 = this.d3,
			offset: number[] = [],
			xScale: ScaleLinear<number, number> = this.xScale,
			stack = d3.stack()
				.keys(gamedata.keys)
				.offset(d3.stackOffsetNone),
			layers = stack(gamedata.teams),
			view = this.view;

		// pan plan to top
		this.plan.raise();

		this.planSegments
			.attr("opacity", function (d: GenericObject, i: number): number {
				let level: GenericObject = <GenericObject>d3.select(this.parentNode).datum(),
					levelIndex: number = level.index,
					levelKey: string = (view == View.overview) ? "level" + (levelIndex+1) : "level" + levelIndex,
					teamIndex: number = i,
					data: NumericObject = layers[levelIndex][teamIndex]["data"],
					currentState: string = data["currentState"];

				if (currentState == levelKey) {
					return 1;
				}
				else {
					return 0;
				}	
			})
			.attr("x", function (d: any, i: number): number {
				let level: GenericObject = <GenericObject>d3.select(this.parentNode).datum(),
					levelIndex: number = level.index,
					teamIndex: number = i,
					currentData: NumericObject = layers[levelIndex][teamIndex],
					isCurrentLevel: boolean = isNaN(currentData[1]),
					x: number = d[0];

				if (isCurrentLevel) {
					offset[teamIndex] = currentData[0] - d[0];	
				}
				
				if (offset[teamIndex] != undefined) {
					let xShifted = x + offset[teamIndex];
					// if next level should start in past, must be shifted to present (as same as all next level)
					if (!isCurrentLevel && xShifted < this.time) {
						offset[teamIndex] += (this.time - xShifted);
						xShifted = this.time;
					}
					x = xShifted;
				}
				return xScale(Math.max(1,x));
			})
			.attr("width", function (d: GenericObject): number {
				// rescale to new x domain
				return this.xScale(d[1]) - this.xScale(d[0]);
			}.bind(this))
			.style("transform", function (d: GenericObject, i:number): string {
				let teamOffset: number =  0;
				if(typeof gamedata.teams[i].offsets !== "undefined" && typeof gamedata.teams[i].offsets[this.sortLevel] !== "undefined") {
					teamOffset = gamedata.teams[i].offsets[this.sortLevel];
				}
				return "translateX(" + xScale(teamOffset) +"px)";
			}.bind(this));

		// rescale bounds (xScale could change)
		if(this.view == View.overview) {
			this.boundSegments
				.attr("x", function (d: GenericObject): string { return this.xScale(d[1]); }.bind(this));
		}
	}

	addDataColumns(dataColumns: GenericObject, gamedata: GameData) {
		let d3: D3 = this.d3;

		//append columns with data (team, time, score)
		d3.select("#" + dataColumns["time"]).html("");
		d3.select("#" + dataColumns["team"]).html("");

		let teamData: any = d3.select("#" + dataColumns["team"]).append("svg")
				.attr("height", this.wrapperHeight);
		let teamDataLayer: any = teamData.append("g")
			.attr("class", "data");

		let teams: any = teamDataLayer.selectAll("text.data-team")
			.data(gamedata.teams)
			.enter().append("text")
			.text(function (d: GenericObject): string { return d.team; }.bind(this))
			.attr("y", function (d: GenericObject): string { return this.yScale(d.team)+this.yScale.bandwidth()*0.6 + this.padding.top; }.bind(this))
			.attr("x", 130)
			.style("text-anchor", "end");


		let timeData: any = d3.select("#" + dataColumns["time"]).append("svg")
				.attr("height", this.wrapperHeight);
		let timeDataLayer: any = timeData.append("g")
			.attr("class", "data");

		let times: any = timeDataLayer.selectAll("text.data-time")
			.data(gamedata.teams)
			.enter().append("text")
			.text(function (d: GenericObject): string { return !isNaN(d.totalTime) ? this.getTimeString(d.totalTime) : "" }.bind(this))
			.attr("y", function (d: GenericObject): string { return this.yScale(d.team)+this.yScale.bandwidth()*0.6 + this.padding.top; }.bind(this))
			.attr("x", 0);
	}

	pan(left?: number) {
		if (typeof this.gameChart === 'undefined') {
			return;
		}

		if(typeof left == "undefined") left = 0;
		let pan: number = this.panValue + left;
		pan = Math.max(-(this.width-this.wrapperWidth), pan);
		pan = Math.min(0, pan);
		this.gameChart.style("transform", "translate("+pan+"px, 0)");
		
		this.levelSortOptions.forEach(function(level) {
			level.translate = "translate(calc(-50% + "+(pan+15)+"px), 0)";
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
		switch(this.selectedViewValue) {	
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
		if(this.zoomValue < this.config.maxZoomValue) {
			let newZoomValue = Math.min(this.config.maxZoomValue, this.zoomValue+this.config.zoomStep),
				scale = newZoomValue / this.zoomValue,
				dx = (-$event.left+this.panValue) * scale + $event.left - this.panValue;

			this.zoomValue = newZoomValue;
			this.drawChart();

			//because of team highlighting animation, add class which cancels the animation after zoom
			this.outerWrapper.classed("ctf-progress-zoom", true);
			setTimeout(function() {
				this.outerWrapper.classed("ctf-progress-zoom", false);
			}.bind(this), 150);
			
			this.pan(dx);
			this.updatePanValue();
		}
	}

	onMouseWheelDown($event: any) {
		if(this.zoomValue > 1) {
			let newZoomValue = Math.max(1, this.zoomValue-this.config.zoomStep),
				scale = newZoomValue / this.zoomValue,
				dx = (-$event.left+this.panValue) * scale + $event.left - this.panValue;

			this.zoomValue = newZoomValue;
			this.drawChart();

			//because of team highlighting animation, add class which cancels the animation after zoom
			this.outerWrapper.classed("ctf-progress-zoom", true);
			setTimeout(function() {
				this.outerWrapper.classed("ctf-progress-zoom", false);
			}.bind(this), 150);

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

	onSortValueChange(sortType: string, sortReverse: boolean, levelIndex?: number): void {
		this.sortType = sortType;
		this.sortReverse = sortReverse;
		if(typeof levelIndex !== "undefined") {
			this.sortLevel = levelIndex;
		}
		else {
			this.sortLevel = 0;
		}
		this.drawChart();
	}

	watchGameProgress() {
		let interval: number = this.config.loadDataInterval
		this.loadData();
		this.loadTimer = setInterval(function (): void {
			this.loadData();
		}.bind(this), interval);
	}

	loadDataFromCSV(endInPercents: number = 100) {
		let file: File = this.csvInput.nativeElement.files[0];
		this.errorMessage = null;
		this.loadCsvDataService.getGameAndPlanData(file, this.config.levelsTimePlan, endInPercents).subscribe((data: Data) => {
			this.gamedataset = data.gameDataset;
			this.plandataset = data.planDataset;
			this.levels = data.levels;
			this.levelsTimePlan = data.levelsTimePlan;
			this.time = data.time;
			this.drawChart();
		}, (error: string) => {
			this.errorMessage = error;
		});
	}

	simulateCSVGameProgress(start: number = 0, end: number = 100, step: number = 1, interval: number = 100): void {
		let currentEnd = start;

		this.loadDataFromCSV(currentEnd);
		this.loadTimer = setInterval(function (): void {
			currentEnd += step;
			if (currentEnd > end) {
				clearInterval(this.loadTimer);
				return;
			}
			this.loadDataFromCSV(currentEnd);
		}.bind(this), interval);
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

		let transform: string = this.gameChart.style("transform"),
			translate: string[] = transform.substring(transform.indexOf("translate(")+10, transform.indexOf(")")).split(","),
			xStr: string = translate[0],
			x: number = parseInt(xStr.substr(0, xStr.length-2));
		if(!x) x = 0;
		this.panValue = x;
	}

	clear(): void {
		this.d3.select("#ctf-progress-chart").html("");
		this.d3.selectAll(".ctf-progress-column-data").html("");
		this.hasData = false;
	}

	getXAxisTickFormat(data: any): string {
		return (this.wrapperWidth > 650) ? this.getTimeString(data) : this.getTimeString(data).substring(0, 5);
	}

	getTimeString(seconds: number): string {
		var hours: number = Math.floor(seconds / 3600);
		var minutes: number = Math.floor((seconds - (hours * 3600)) / 60);
		var seconds: number = seconds - (hours * 3600) - (minutes * 60);

		return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
	}

	getColor(level: number): string {
		if(this.view == View.progress) {
			if(level == 0) return "transparent";
			else level -= 1;
		}
		let colorsCount: number = this.config.gameColors.length;
		return this.config.gameColors[level%colorsCount];
	}

	getPlanColor(level: number): string {
		if(this.view == View.progress) {
			if(level == 0) return "transparent";
			else level -= 1;
		}
		let colorsCount: number = this.config.planColors.length;
		return this.config.planColors[level%colorsCount];
	}

	getLightenedColor(level: number): string {
		if(this.view == View.progress) {
			if(level == 0) return "transparent";
			else level -= 1;
		}
		let colorsCount: number = this.config.lightenedColors.length;
		return this.config.lightenedColors[level%colorsCount];
	}
}