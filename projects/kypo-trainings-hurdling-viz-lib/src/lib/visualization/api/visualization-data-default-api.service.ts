import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { TraineeDTO } from '../DTOs/trainee-dto';
import { VisualizationDataDTO } from '../DTOs/visualization-data-dto';
import { CommandLineMapper } from '../mappers/command-line-mapper';
import { TraineeMapper } from '../mappers/trainee-mapper';
import { VisualizationDataMapper } from '../mappers/visualization-data-mapper';
import { CommandLineEntry } from '../models/command-line-entry';
import { Trainee } from '../models/trainee';
import { VisualizationData } from '../models/visualization-data';
import { VisualizationDataApi } from './visualization-data-api.service';

/**
 * Default implementation of service abstracting http communication with visualization data endpoints.
 */
@Injectable()
export class VisualizationDataDefaultApi extends VisualizationDataApi {
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
  ) {
    super();
  }

  /**
   * Sends http request to retrieve all data for visualizations
   */
  getVisualizationData(trainingInstanceId: number): Observable<VisualizationData> {
    return this.http
      .get<VisualizationDataDTO>(
        this.configService.config.trainingServiceUrl +
          `visualizations/training-instances/${trainingInstanceId}/progress`,
      )
      .pipe(map((response) => VisualizationDataMapper.fromDTO(response)));
  }

  /**
   * Sends http request to retrieve commandline data for training run
   */
  getTrainingRunData(trainingInstanceId: number, trainingRunId: number): Observable<CommandLineEntry[]> {
    return this.http
      .get<any>(
        this.configService.config.trainingServiceUrl +
          `visualizations/training-instances/${trainingInstanceId}/training-runs/${trainingRunId}/commands`,
      )
      .pipe(map((response) => CommandLineMapper.fromDTOs(response)));
  }
}
