import {Injectable} from '@angular/core';
import {Kypo2TrainingsHurdlingVizLibConfig} from './kypo2-trainings-hurdling-viz-lib';

@Injectable()
export class ConfigService {
  private readonly _config: Kypo2TrainingsHurdlingVizLibConfig;
  private _definitionId: number;
  private _gameId: number;

  get definitionId(): number {
    return this._definitionId;
  }

  set definitionId(value: number) {
    this._definitionId = value;
  }

  get gameId(): number {
    return this._gameId;
  }

  set gameId(value: number) {
    this._gameId = value;
  }

  get config(): Kypo2TrainingsHurdlingVizLibConfig {
    return this._config;
  }

  constructor(config: Kypo2TrainingsHurdlingVizLibConfig) {
    this._config = config;
  }
}
