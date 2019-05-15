import {GenericObject} from '../models/generic-object.type';
import {View} from '../models/view.enum';

export class Kypo2TrainingsHurdlingVizLibConfig {
  kypo2TrainingsHurdlingRestBasePath: string;
  apiUrl: string;
  token: string; // temp
  levelsTimePlan: number[];
  gameColors: string[];
  darkColor: string;
  eventShapePaths: GenericObject;
  minBarHeight: number;
  maxBarHeight: number;
  maxZoomValue: number;
  zoomStep: number;
  simulationInterval: number;
  loadDataInterval: number;
  defaultView: View;
}
