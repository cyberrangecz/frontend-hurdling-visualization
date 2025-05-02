import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { catchError, delay, EMPTY, exhaustMap, Observable, of, repeat, timer } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';
import { VisualizationDataDTO } from '../../DTOs/visualization-data-dto';
import { VisualizationDataMapper } from '../../mappers/visualization-data-mapper';
import { HurdlingVisualizationData } from '../../models/hurdling-visualization-data';
import { VisualizationsDataService } from '../../services/visualizations-data.service';
import { AppConfig } from '../../../app.config';
import { ProgressView } from '../../models/view.enum';
import { EventType } from '../../models/enums/event-type.enum';
import { TrainingAnalysisEventService } from '../../models/training-analysis-event-service';
import { ProgressSubjectData } from '../../models/progress-subject-progress-data';
import { SubjectDisplayTypeEnum } from '../../models/enums/subject-view-type.enum';

@Component({
    selector: 'crczp-hurdling-visualization',
    templateUrl: './visualizations.component.html',
    styleUrls: ['./visualizations.component.css'],
})
export class VisualizationsComponent implements OnInit, OnDestroy {
    @Input() isCoop: boolean = false;
    @Input() trainingDefinitionId: number;
    @Input() trainingInstanceId: number;
    @Input() JSONData: VisualizationDataDTO;
    @Input() view = this.appConfig.defaultView;
    @Input() selectedSubjectView: SubjectDisplayTypeEnum = SubjectDisplayTypeEnum.Avatar;
    @Input() colorScheme: string[];
    @Input() eventService: TrainingAnalysisEventService;
    @Input() setDashboardView = false;
    @Input() externalFilters;
    @Input() trainingColors = this.appConfig.trainingColors;
    @Input() subjectColorScheme: string[];
    @Input() selectedSubjects: ProgressSubjectData[];
    @Input() isStandalone: boolean;

    @Output() highlightedSubject: EventEmitter<number> = new EventEmitter();
    @Output() outputSelectedSubjects: EventEmitter<number[]> = new EventEmitter();
    @Output() outputMaxTime: EventEmitter<number> = new EventEmitter();

    visualizationData$: Observable<HurdlingVisualizationData>;

    private isAlive = true;

    public restrictToCustomTimelines: boolean;
    public restrictToVisibleSubjects: boolean;
    public restriction: { type: string; value: number };
    public maxTime: number;
    public stepSize: number;

    constructor(
        private visualizationDataService: VisualizationsDataService,
        private appConfig: AppConfig,
    ) {}

    ngOnInit() {
        if (this.JSONData) {
            if (this.view === ProgressView.Overview) {
                this.visualizationData$ = of(VisualizationDataMapper.fromDTO(this.JSONData));
            } else {
                this.initSimulation();
            }
        } else {
            this.visualizationData$ = this.visualizationDataService.visualizationData$;
            this.loadData();
            this.initUpdateSubscription();
        }
    }

    private loadData() {
        return this.visualizationDataService.getData(this.trainingInstanceId).pipe(takeWhile(() => this.isAlive));
    }

    initSimulation(interval = 1000): void {
        const visualizationData = this.JSONData;
        let time = visualizationData.start_time;

        timer(0, interval)
            .pipe(takeWhile(() => this.isAlive))
            .subscribe(() => {
                const tmp = JSON.parse(JSON.stringify(this.JSONData)) as VisualizationDataDTO;
                tmp.progress.forEach((progressData) =>
                    progressData.levels.forEach(
                        (level) => (level.events = level.events.filter((event) => event.timestamp / 1000 < time)),
                    ),
                );
                tmp.progress = tmp.progress.filter((progressData) => progressData.levels[0].start_time / 1000 < time);

                tmp.progress.forEach((progressData) =>
                    progressData.levels.forEach((level) => {
                        const isCompleted =
                            level.events.findIndex((event) => event.type == EventType.levelCompleted) != -1;
                        const hasStarted =
                            level.events.findIndex((event) => event.type == EventType.levelStarted) != -1;
                        if (!hasStarted) {
                            level.start_time = null;
                            level.state = null;
                            level.end_time = null;
                        } else if (!isCompleted) {
                            level.state = 'RUNNING';
                            level.end_time = null;
                        }
                        level.wrong_answers_number = level.events.filter(
                            (event) => event.timestamp / 1000 <= time && event.type == EventType.wrongFlag,
                        ).length;
                        level.hints_taken = level.events
                            .filter((event) => event.timestamp / 1000 <= time && event.type == EventType.hint)
                            .map((level) => level.hint_id);
                    }),
                );
                tmp.current_time = time;
                time += (interval / 1000) * 10;
                this.visualizationData$ = of(VisualizationDataMapper.fromDTO(tmp));
                // stop simulation when all subjects are finished
                this.isAlive = !(
                    tmp.progress.every((progressData) =>
                        progressData.levels.every((level) => level.state == 'FINISHED'),
                    ) && tmp.progress.length != 0
                );
            });
    }

    /*
    initUpdateSubscription() {
          timer(0, this.appConfig.loadDataInterval)
              .pipe(takeWhile(() => this.isAlive))
              .subscribe(() => this.loadData())
    }*/

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
                        retryAttempt = 1;
                    }
                }),
                catchError((err) => {
                    // on 4xx or 5xx backend response increase attempts
                    retryAttempt++;
                    if (retryAttempt <= this.appConfig.retryAttempts) {
                        return of(EMPTY); // catch error to allow additional attempt
                    } else {
                        return err;
                    }
                }),
                delay(this.appConfig.loadDataInterval * retryAttempt), // increase delay exponentially on error
                repeat(),
            );
        }
        subscription$.pipe(takeWhile(() => this.isAlive)).subscribe();
    }

    emitHighlightedSubject(event: number): void {
        this.highlightedSubject.emit(event);
    }

    selectSubjects(event: number[]): void {
        this.outputSelectedSubjects.emit(event);
    }

    public getViewEnum() {
        return ProgressView;
    }

    restrictionTypeEvent(value: boolean, type: string): void {
        this[type] = value;
    }

    scaleRestrictionEvent(restriction: any): void {
        this.restriction = restriction;
    }

    getMaxTime(time: number): void {
        this.maxTime = time;
    }

    getStepSize(step: number): void {
        this.stepSize = step;
    }

    ngOnDestroy(): void {
        this.isAlive = false;
    }
}
