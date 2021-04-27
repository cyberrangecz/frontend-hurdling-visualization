import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { PlayerDTO } from '../DTOs/player-dto';
import { VisualizationDataDTO } from '../DTOs/visualization-data-dto';
import { PlayerMapper } from '../mappers/player-mapper';
import { VisualizationDataMapper } from '../mappers/visualization-data-mapper';
import { Player } from '../models/player';
import { VisualizationData } from '../models/visualization-data';
import { VisualizationDataApi } from './visualization-data-api.service';

/**
 * Default implementation of service abstracting http communication with visualization data endpoints.
 */
@Injectable()
export class VisualizationDataDefaultApi extends VisualizationDataApi {
  

  constructor(private http: HttpClient, private configService: ConfigService) {
      super();
    }
    
  /**
   * Sends http request to retrieve all data for visualizations
   */
  getVisualizationData(trainingInstanceId: number): Observable<VisualizationData> {

    return this.http
      .get<VisualizationDataDTO>(
        this.configService.config.trainingServiceUrl + `visualizations/training-instances/${trainingInstanceId}/progress`
      )
      .pipe(
        map(
          (response) =>
              VisualizationDataMapper.fromDTO(response),
        )
      );
  }
}
