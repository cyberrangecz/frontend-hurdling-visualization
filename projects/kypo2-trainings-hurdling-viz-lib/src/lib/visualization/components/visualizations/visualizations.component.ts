import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {catchError, delay, EMPTY, exhaustMap, Observable, of, repeat, retryWhen, timer} from 'rxjs';
import {takeUntil, takeWhile, tap} from 'rxjs/operators';
import {VisualizationDataDTO} from '../../DTOs/visualization-data-dto';
import {VisualizationDataMapper} from '../../mappers/visualization-data-mapper';
import {VisualizationData} from '../../models/visualization-data';
import {VisualizationsDataService} from '../../services/visualizations-data.service';
import {AppConfig} from '../../../app.config';
import {View} from '../../models/view.enum';
import {EventType} from '../../models/enums/event-type.enum';
import {PlayerView} from '../../models/enums/player-view..enum';
import {TrainingAnalysisEventService} from '../../models/training-analysis-event-service';
import {Player} from "../../models/player";

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

  @Input() selectedTrainees: Player[];
  @Input() isStandalone: boolean;
  @Output() highlightedPlayer: EventEmitter<number> = new EventEmitter();
  @Output() outputSelectedPlayers = new EventEmitter<number[]>();

  visualizationData$: Observable<VisualizationData>;

  private isAlive = true;

  constructor(
    private visualizationDataService: VisualizationsDataService,
    private appConfig: AppConfig
  ) {}

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
      this.initUpdateSubscription();
    }
  }

  private loadData() {
    return this.visualizationDataService
      .getData(this.trainingInstanceId)
      .pipe(takeWhile(() => this.isAlive))
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
    let retryAttempt = 1;
    let subscription$;
    if (this.isStandalone) {
      subscription$ = this.loadData();
    } else {
      subscription$ = of({}).pipe(
          exhaustMap(() => this.loadData()), // waits for the response
          tap(() => {
            // reset retry on successful request if it was previously increased (this resets polling delay as well)
            if (retryAttempt > 1) {
              retryAttempt = 1
            }
          }),
          catchError((err) => {
            // on 4xx or 5xx backend response increase attempts
            retryAttempt++;
            if (retryAttempt <= this.appConfig.retryAttempts) {
              return of(EMPTY) // catch error to allow additional attempt
            } else {
              return err
            }
          }),
          delay(this.appConfig.loadDataInterval * retryAttempt), // increase delay exponentially on error
          repeat()
      );
    }
    subscription$.pipe(takeWhile(() => this.isAlive)).subscribe();
  }

  emitHighlightedPlayer(event: number): void {
    this.highlightedPlayer.emit(event);
  }

  selectedPlayers(event: number[]): void {
    this.outputSelectedPlayers.emit(event);
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

}
