import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription, timer } from 'rxjs';
import { filter, map, takeWhile } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { VisualizationDataDTO } from '../../DTOs/visualization-data-dto';
import { VisualizationDataMapper } from '../../mappers/visualization-data-mapper';
import { VisualizationData } from '../../models/visualization-data';
import { VisualizationsDataService } from '../../services/visualizations-data.service';
import { AppConfig } from '../../../app.config';
import { View } from '../../models/view.enum';
import { EventType } from '../../models/enums/event-type.enum';
import { PlayerView } from '../../models/enums/player-view..enum';
import { TrainingAnalysisEventService } from '../../models/training-analysis-event-service';

@Component({
  selector: 'kypo-hurdling-visualization',
  templateUrl: './visualizations.component.html',
  styleUrls: ['./visualizations.component.css']
})
export class VisualizationsComponent implements OnInit, OnDestroy {

  @Input() trainingDefinitionId: number;
  @Input() trainingInstanceId: number;
  @Input() JSONData: VisualizationDataDTO;
  @Input() view = this.appConfig.defaultView;
  @Input() selectedPlayerView: PlayerView = PlayerView.Avatar;
  @Input() colorScheme: string[];
  @Input() eventService: TrainingAnalysisEventService;
  @Input() setDashboardView = false;
  @Input() externalFilters;
  @Input() trainingColors = this.appConfig.trainingColors;
  @Input() playerColorScheme: string[];

  visualizationData$: Observable<VisualizationData>;

  private isAlive = true;

  constructor(
    private visualizationDataService: VisualizationsDataService,
    private appConfig: AppConfig
  ) {
    
  }

  ngOnInit() { 
    if(this.JSONData) {
      if(this.view === View.Overview){
        this.visualizationData$ = of(VisualizationDataMapper.fromDTO(this.JSONData));
      }
      else {
        this.initSimulation()
      }
      
    }
    else {
      this.visualizationData$ = this.visualizationDataService.visualizationData$;
      this.loadData();
      this.initUpdateSubscription();
    }
  }

  private loadData() {
    this.visualizationDataService
      .getData(this.trainingInstanceId)
      .pipe(takeWhile(() => this.isAlive))
      .subscribe();
  }

  initSimulation(interval: number = 1000):void {
    let visualizationData = this.JSONData;
    let time = visualizationData.start_time;
    
    timer(0,interval)
    .pipe(takeWhile(() => this.isAlive))
    .subscribe(() => {
      let tmp = JSON.parse(JSON.stringify(this.JSONData)) as VisualizationDataDTO;
      tmp.player_progress
      .forEach(playerProgress => playerProgress.levels.forEach(level => level.events = level.events.filter(event => event.timestamp/1000 < time)))
      tmp.player_progress = tmp.player_progress.filter(playerProgress => playerProgress.levels[0].start_time/1000 < time)

      tmp.player_progress
      .forEach(playerProgress => playerProgress.levels.forEach(level => {
        const isCompleted = level.events.findIndex(event => event.type == EventType.levelCompleted) != -1;
        const hasStarted = level.events.findIndex(event => event.type == EventType.levelStarted) != -1;
        if(!hasStarted) {
          level.start_time = null;
          level.state = null;
          level.end_time = null;
        }
        else if(!isCompleted) {
          level.state = "RUNNING";
          level.end_time = null;
        }
        level.wrong_answers_number=level.events.filter(event => event.timestamp/1000 <= time && event.type==EventType.wrongAnswer).length;
        level.hints_taken=level.events.filter(event => event.timestamp/1000 <= time && event.type==EventType.hint).map(level=> level.hint_id);
      }))
      tmp.current_time=time;
      time+=interval/1000*10;
      this.visualizationData$ = of(VisualizationDataMapper.fromDTO(tmp))
      // stop simulation when all players are finished
      this.isAlive = !(tmp.player_progress.every(playerProgress => playerProgress.levels.every(level => level.state == 'FINISHED')) && tmp.player_progress.length != 0);
    })
   
  }

  initUpdateSubscription() {
    timer(0, this.appConfig.loadDataInterval)
    .pipe(takeWhile(() => this.isAlive))
    .subscribe(() => this.loadData())
  }


  ngOnDestroy(): void {
    this.isAlive = false;
  }

}
