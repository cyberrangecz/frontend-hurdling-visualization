import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommandLineEntry } from '../models/command-line-entry';
import { VisualizationData } from '../models/visualization-data';

export abstract class VisualizationsDataService {
  protected visualizationDataSubject$: ReplaySubject<VisualizationData> = new ReplaySubject();
  protected commandLineDataSubject$: ReplaySubject<CommandLineEntry[]> = new ReplaySubject();

  visualizationData$: Observable<VisualizationData> = this.visualizationDataSubject$
    .asObservable()
    .pipe(filter((vd) => vd !== undefined && vd !== null));

  commandLineData$: Observable<CommandLineEntry[]> = this.commandLineDataSubject$
    .asObservable()
    .pipe(filter((vd) => vd !== undefined && vd !== null));

  abstract getData(trainingInstanceId: number): Observable<VisualizationData>;

  abstract getCommandLineData(trainingInstanceId: number, trainingRunId: number): Observable<CommandLineEntry[]>;
}
