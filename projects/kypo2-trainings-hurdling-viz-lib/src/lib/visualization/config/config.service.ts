import {Injectable} from '@angular/core';
import {Kypo2TrainingsVisualizationOverviewLibConfig} from './kypo2-trainings-visualization-overview-lib';

@Injectable()
export class ConfigService {
  private readonly _config: Kypo2TrainingsVisualizationOverviewLibConfig;

  get config(): Kypo2TrainingsVisualizationOverviewLibConfig {
    return this._config;
  }

  constructor(config: Kypo2TrainingsVisualizationOverviewLibConfig) {
    this._config = config;
  }
}
