import {Injectable} from '@angular/core';
import {Kypo2TrainingsHurdlingVizLibConfig} from './kypo2-trainings-hurdling-viz-lib';

@Injectable()
export class ConfigService {
  private readonly _config: Kypo2TrainingsHurdlingVizLibConfig;
  private _trainingDefinitionId: number;
  private _trainingInstanceId: number;

  get trainingDefinitionId(): number {
    return this._trainingDefinitionId;
  }

  set trainingDefinitionId(value: number) {
    this._trainingDefinitionId = value;
  }

  get trainingInstanceId(): number {
    return this._trainingInstanceId;
  }

  set trainingInstanceId(value: number) {
    this._trainingInstanceId = value;
  }

  get config(): Kypo2TrainingsHurdlingVizLibConfig {
    return this._config;
  }

  constructor(config: Kypo2TrainingsHurdlingVizLibConfig) {
    this._config = config;
  }
}
