import { Observable } from 'rxjs';
import { CommandLineEntry } from '../models/command-line-entry';
import { HurdlingVisualizationData } from '../models/hurdling-visualization-data';

/**
 * Service abstracting http communication with visualization data endpoints.
 */
export abstract class VisualizationDataApi {
    /**
     * Sends http request to retrieve all visualization data
     */
    abstract getVisualizationData(trainingInstanceId: number): Observable<HurdlingVisualizationData>;

    /**
     * Sends http request to retrieve commandline data for training run
     */
    abstract getTrainingRunData(trainingInstanceId: number, trainingRunId: number): Observable<CommandLineEntry[]>;
}
