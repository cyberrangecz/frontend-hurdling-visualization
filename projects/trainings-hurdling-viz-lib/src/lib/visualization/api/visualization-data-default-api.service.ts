import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { VisualizationDataDTO } from '../DTOs/visualization-data-dto';
import { CommandLineMapper } from '../mappers/command-line-mapper';
import { VisualizationDataMapper } from '../mappers/visualization-data-mapper';
import { CommandLineEntry } from '../models/command-line-entry';
import { HurdlingVisualizationData } from '../models/hurdling-visualization-data';
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
    getVisualizationData(trainingInstanceId: number): Observable<HurdlingVisualizationData> {
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
