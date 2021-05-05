import { Component, Input, OnChanges, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { D3, D3Service } from '@muni-kypo-crp/d3-service';
import { AppConfig } from '../../../../app.config';
import { LevelTypeEnum } from '../../../enums/level-type.enum';
import { GameTimeOverviewData } from '../../../models/game-time-overview-data';
import { Hint } from '../../../models/hint';
import { HintTakenEvent } from '../../../models/hint-taken-event';
import { Level } from '../../../models/level';
import { LevelTimelineData } from '../../../models/level-timeline-data';
import { Player } from '../../../models/player';
import { PlayerLevel } from '../../../models/player-level';
import { VisualizationData } from '../../../models/visualization-data';
import { WrongFlagData } from '../../../models/wrong-flag-data';
import { WrongFlagEvent } from '../../../models/wrong-flag-event';

@Component({
  selector: 'kypo2-player-detail',
  templateUrl: './player-detail.component.html',
  styleUrls: ['./player-detail.component.css']
})
export class PlayerDetailComponent implements OnChanges, AfterViewInit {

  @Input() player: Player;
  @Input() visualizationData: VisualizationData;

  @Output() hideDetail = new EventEmitter();

  private readonly d3: D3;

  constructor( d3Service: D3Service, private appConfig: AppConfig,) { 
    this.d3 = d3Service.getD3();
  }

  
  ngOnChanges(): void {
    this.createGameTimeOverview();
    this.createLevelTimeline();
  }

  ngAfterViewInit(): void {
    this.createGameTimeOverview();
    this.createLevelTimeline();
  }

  getCurrentLevel(): Level {
    return this.visualizationData.levels.find(level => level.id == this.getCurrentPlayerLevel()?.id)
  }

  getCurrentPlayerLevel(): PlayerLevel {
    return this.visualizationData.playerProgress
      .find(p => p.userRefId == this.player.userRefId).levels.find(level => level.state != 'FINISHED');
  }

  getHints(): Hint[] {
    return this.getCurrentLevel().hints.sort((a, b) => a.title.localeCompare(b.title));
  }

  getHintsUsed(): number {
    return this.getCurrentPlayerLevel().hintsTaken?.length ? this.getCurrentPlayerLevel().hintsTaken.length : 0;
  }
  
  hintUsed(hint: Hint): boolean {
    return this.getCurrentPlayerLevel().hintsTaken?.find(h => h == hint.id) ? true : false;
  }

  getLevelsTimePlan(): number[]{
    return this.visualizationData.levels.map((level: Level) => level.estimatedDuration > 0 ? level.estimatedDuration*60 : 60);
  }

  getLevelColor(levelId: number): string {
    return this.getCurrentPlayerLevel().id == levelId ? 'green' : 'lightgray';
  }

  getWrongFlags(): WrongFlagData[] {
    const wrongFlagData = [];
    this.getCurrentPlayerLevel().events
      .filter(event => event instanceof WrongFlagEvent)
      .forEach(event => {
        const index = wrongFlagData.findIndex(data => data.value == (event as WrongFlagEvent).flagContent);
        if(index != -1) {
          wrongFlagData[index].timesUsed++;
          const wrongFlagLastTime =  Math.ceil((this.visualizationData.currentTime - event.timestamp)/60);
          wrongFlagData[index].lastUsed = wrongFlagLastTime == 1 ? wrongFlagLastTime + ' minute ago' : wrongFlagLastTime + ' minutes ago';
        }
        else {
          const wrongFlagDataEntry = new WrongFlagData();
          wrongFlagDataEntry.value = (event as WrongFlagEvent).flagContent;
          wrongFlagDataEntry.timesUsed = 1;
          const wrongFlagLastTime = Math.ceil((this.visualizationData.currentTime - event.timestamp)/60);
          wrongFlagDataEntry.lastUsed =  wrongFlagLastTime == 1 ? wrongFlagLastTime + ' minute ago' : wrongFlagLastTime + ' minutes ago';
          wrongFlagData.push(wrongFlagDataEntry);
        }
    });
    return wrongFlagData;
  }

  getUsedHintTime(hint: Hint): string {
    const hintTakenTime = this.getCurrentPlayerLevel().events
      .filter(event => event instanceof HintTakenEvent)
      .find((event: HintTakenEvent) => event.hintId == hint.id).timestamp;
    const hintTakenMinutes = Math.ceil((this.visualizationData.currentTime - hintTakenTime)/60);
    return hintTakenMinutes == 1 ? hintTakenMinutes + ' minute ago' : hintTakenMinutes + ' minutes ago';
  }

  getLowerLevelData(levelId: number): string {
    const currentLevel = this.getCurrentLevel();
    if(currentLevel.id == levelId) {
      return `in ${currentLevel.order + 1}. level, ${currentLevel.title}`;
    }
    return '';
  }

  getUpperLevelData(levelId: number): string {
    const currentLevel = this.getCurrentLevel();
    if(currentLevel.id == levelId) {
      let res = this.timeDifference(this.visualizationData.currentTime, this.getCurrentPlayerLevel().startTime);
      const minutesInLevel = (this.visualizationData.currentTime- this.getCurrentPlayerLevel().startTime)/60;
      if(minutesInLevel > currentLevel.estimatedDuration && currentLevel.estimatedDuration != 0) {
        res += ` (~ ${Math.floor(minutesInLevel - currentLevel.estimatedDuration)} minutes behind)`
      }
      
      return res;
    }
    return '';
  }

  timeDifference(timestamp1: number, timestamp2: number): string {
    let difference = timestamp1 - timestamp2;

    const hoursDifference = Math.floor(difference/60/60);
    difference -= hoursDifference*60*60

    const minutesDifference = Math.floor(difference/60);
    difference -= minutesDifference*60

    const secondsDifference = Math.floor(difference);

    return `${this.pad(hoursDifference)}:${this.pad(minutesDifference)}:${this.pad(secondsDifference)}`
  }

  pad(num:number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  createGameTimeOverview(): void {

    this.d3.select('.game-time-overview').html('');

    if(!this.getCurrentLevel()) {
      return;
    }

    let sum = 0;
    const data = this.visualizationData.levels.map((level) => {
      const data = new GameTimeOverviewData();
      data.start = sum
      sum+=level.estimatedDuration > 0 ? level.estimatedDuration*60 : 60;
      data.end = sum;
      data.levelId = level.id;
      return data;
    })

    const width = '100%';
    const height = 10;

    const chart = this.d3.select('.game-time-overview')
      .append('svg') 
      .attr('class', 'chart')
      .attr('width', width)
      .attr('height', 5*height)

    const el   = document.getElementsByClassName('level-timeline');
    const rect = el[0] ? el[0].getBoundingClientRect() : {width: 0};

    const scale = this.d3.scaleLinear() 
      .domain([0, sum])
      .range([0, rect?.width - rect?.width*0.5]);
     
    const bar = chart.selectAll('rect')
      .data(data)
      .enter()
      .append('g')

      // create level bars
      bar
      .append('rect')
      .attr('height', height*0.7)
      .attr('width', (d): number => {return scale(d.end) - scale(d.start) - 1})
      .attr('x', (d): number => scale(d.start))
      .attr('y', 20)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', (d) => this.getLevelColor(d.levelId))
      
      //append upper text
      bar
      .append('text')
      .attr('x', (d): number => scale(d.start))
      .attr('y', 15)
      .attr('height', 10)
      .text((d) => {
        return this.getUpperLevelData(d.levelId);
      });

      //append lower text
      bar
      .append('text')
      .attr('x', (d): number => scale(d.start))
      .attr('y', 45)
      .attr('height', 10)
      .text((d) => { 
        return this.getLowerLevelData(d.levelId);
      });
    
  }

  createLevelTimeline(): void {
    this.d3.select('.level-timeline').html('');

    if(!this.getCurrentLevel()) {
      return;
    }

    const offset = (this.visualizationData.currentTime - this.getCurrentPlayerLevel().startTime)*0.05;
    const startTime = this.getCurrentPlayerLevel().startTime;
    const currentTime = this.visualizationData.currentTime;

    const width = '100%';
    const height = 100;

    const levelTimeline = this.d3.select('.level-timeline')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const el   = document.getElementsByClassName('level-timeline');
    const rect = el[0] ? el[0].getBoundingClientRect() : {width: 0};

    // Create scale
    const scale = this.d3.scaleLinear()
                  .domain([startTime-offset, currentTime+offset])
                  .range([0, rect.width - 1]);

    // Add scales to axis
    const x_axis = this.d3
      .axisBottom(scale)
      .tickFormat(d => this.timeDifference(d.valueOf(), this.visualizationData.startTime))

    //Append timeline
    levelTimeline
      .append('g')
      .attr('transform', 'translate(0, ' + height / 2 + ')')
      .call(x_axis);

    const events =levelTimeline
    .append('g')
    .selectAll('path.event') 
    .data(this.getTimelineData())
    .enter()
    .append('g');

    // used for alternating position of event labels
    let position = 0;

    //append events
    events
    .append('path')
    .attr('class', 'event')
    .attr('d', (d) => d.icon)
    .attr('transform',(d) => 'translate(' + scale(d.timestamp) + ',' + height/2.4 + ') scale(' + 1 + ')')
    .attr('fill', 'lightgrey')


    //append events line
    events
    .append('line')
    .attr('transform',(d) => 'translate(' + (scale(d.timestamp) + 8) + ',' + height/2.4 + ') scale(' + 1 + ')')
    .attr('y1', (_, i) => {return i % 2 ? 16 : 0;})
    .attr('y2', (_, i) => {return i % 2 ? 23 : -7 ;})
    .attr('width', 1)
    .attr('stroke-width', 1)
    .attr('stroke', 'black');

    //append events text
    events
    .append('text')
    .attr('transform',(d) => 'translate(' + (scale(d.timestamp) + 8) + ',' + height/2.4 + ') scale(' + 1 + ')')
    .attr('y', () => {position++; return position % 2 ?  -10 : 40;})
    .style('text-anchor', 'middle')
    .style('fill', (d) => d.color)
    .text((d) => {
      return d.value;
    });
  }

  getTimelineData(): LevelTimelineData[] {
    const data = [];
    const currentLevel = this.getCurrentLevel();
    const levelStarted = new LevelTimelineData();
    levelStarted.icon = this.appConfig.eventShapePaths['hint'];
    levelStarted.value = 'Started Level' + (currentLevel.order + 1);
    levelStarted.timestamp = this.getCurrentPlayerLevel().startTime;
    levelStarted.color = 'black';
    data.push(levelStarted);
    this.getCurrentPlayerLevel().events
      .filter(event => event instanceof HintTakenEvent || event instanceof WrongFlagEvent)
      .forEach(event => {
        const eventTimelineData = new LevelTimelineData();
        eventTimelineData.icon = this.appConfig.eventShapePaths[event.type];
        eventTimelineData.value = event instanceof HintTakenEvent 
                                    ? (event as HintTakenEvent).hintTitle : (event as WrongFlagEvent).flagContent;
        eventTimelineData.color = event instanceof HintTakenEvent ? 'black' : 'red';            
        eventTimelineData.timestamp = event.timestamp;
        data.push(eventTimelineData)
    }) 
    return data;
  }

  isGameLevel(): boolean {
    return this.getCurrentLevel()?.levelType == LevelTypeEnum.Game;
  }

  onResize(): void {
    this.createLevelTimeline();
    this.createGameTimeOverview();
  }

  onOverviewClick(): void {
    this.hideDetail.emit(null);
  }

}