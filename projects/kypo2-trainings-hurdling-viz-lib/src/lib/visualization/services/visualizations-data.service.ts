import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Player } from '../models/player';
import { VisualizationData } from '../models/visualization-data';

export abstract class VisualizationsDataService {

  protected visualizationDataSubject$: ReplaySubject<VisualizationData> = new ReplaySubject();

  visualizationData$: Observable<VisualizationData> = this.visualizationDataSubject$
    .asObservable()
    .pipe(filter((vd) => vd !== undefined && vd !== null));

  abstract getData(trainingInstanceId: number): Observable<VisualizationData>;

  abstract getPlayers(): Observable<Player[]>;

}
