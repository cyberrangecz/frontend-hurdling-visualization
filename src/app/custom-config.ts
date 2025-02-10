import { environment } from '../environments/environment';
import { HurdlingVisualizationConfig } from '../../projects/trainings-hurdling-viz-lib/src/public_api';

export const CustomConfig: HurdlingVisualizationConfig = {
    trainingServiceUrl: environment.trainingServiceUrl,
};
