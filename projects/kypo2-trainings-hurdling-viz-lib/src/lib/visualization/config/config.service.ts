import {Injectable} from '@angular/core';
import {Kypo2TrainingsHurdlingVizLibConfig} from './kypo2-trainings-hurdling-viz-lib';

@Injectable()
export class ConfigService {
  private readonly _config: Kypo2TrainingsHurdlingVizLibConfig;

  get config(): Kypo2TrainingsHurdlingVizLibConfig {
    return this._config;
  }

  constructor(config: Kypo2TrainingsHurdlingVizLibConfig) {
    this._config = config;
  }
}
