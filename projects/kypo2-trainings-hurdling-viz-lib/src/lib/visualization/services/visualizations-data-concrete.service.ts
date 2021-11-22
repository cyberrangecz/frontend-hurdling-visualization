import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { VisualizationDataApi } from '../api/visualization-data-api.service';
import { VisualizationData } from '../models/visualization-data';
import { VisualizationsDataService } from './visualizations-data.service';

@Injectable()
export class VisualizationsDataConcreteService extends VisualizationsDataService{

constructor(private visualizationApi: VisualizationDataApi) { 
  super();
}

getData(trainingInstanceId: number): Observable<VisualizationData> {

  return this.visualizationApi.getVisualizationData(trainingInstanceId).pipe(
    tap(
      (visualizationData) => {
        this.visualizationDataSubject$.next(visualizationData);
      },
      (err) => {
        console.log(err)
      }
    )
  );
  
}

getCommandLineData(trainingInstanceId: number, trainingRunId: number): Observable<any> {
  return this.visualizationApi.getTrainingRunData(trainingInstanceId, trainingRunId).pipe(
    tap(
      (commandLineData) => {
        this.commandLineDataSubject$.next(commandLineData);
      },
      (err) => {
        console.log(err)
      }
    )
  );
}

}
