import {environment} from '../environments/environment';
import {HurdlingVisualizationConfig } from '../../projects/kypo2-trainings-hurdling-viz-lib/src/public_api';

export const CustomConfig: HurdlingVisualizationConfig = {
  trainingServiceUrl: environment.trainingServiceUrl,
  elasticSearchServiceUrl: environment.elasticSearchServiceUrl
};
