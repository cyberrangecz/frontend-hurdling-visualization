import {Injectable} from '@angular/core';
import {HurdlingVisualizationConfig} from './kypo-trainings-hurdling-viz-lib';

@Injectable()
export class ConfigService {
  private readonly _config: HurdlingVisualizationConfig;
  private _trainingDefinitionId: number;
  private _trainingInstanceId: number;
  private _trainingColors: string[];
  private _simulationInterval: number;
  private _loadDataInterval: number;

  get trainingColors(): string[] {
    return this._trainingColors;
  }

  set trainingColors(value: string[]) {
    this._trainingColors = value;
  }

  get simulationInterval(): number {
    return this._simulationInterval;
  }

  set simulationInterval(value: number) {
    this._simulationInterval = value;
  }

  get loadDataInterval(): number {
    return this._loadDataInterval;
  }

  set loadDataInterval(value: number) {
    this._loadDataInterval = value;
  }

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

  get config(): HurdlingVisualizationConfig {
    return this._config;
  }

  constructor(config: HurdlingVisualizationConfig) {
    this._config = config;
  }
}
