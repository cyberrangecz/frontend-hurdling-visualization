import {environment} from '../environments/environment';
import {Kypo2TrainingsHurdlingVizLibConfig} from '../../projects/kypo2-trainings-hurdling-viz-lib/src/public_api';

export const CustomConfig: Kypo2TrainingsHurdlingVizLibConfig = {
  kypo2TrainingsHurdlingRestBasePath: environment.kypo2TrainingsHurdlingRestBasePath,
  apiUrl: environment.apiUrl,
  token: environment.token, // temp
  levelsTimePlan: environment.levelsTimePlan,
  gameColors: environment.gameColors,
  darkColor: environment.darkColor,
  eventShapePaths: environment.eventShapePaths,
  minBarHeight: environment.minBarHeight,
  maxBarHeight: environment.maxBarHeight,
  maxZoomValue: environment.maxZoomValue,
  zoomStep: environment.zoomStep,
  simulationInterval: environment.simulationInterval,
  loadDataInterval: environment.loadDataInterval,
  defaultView: environment.defaultView
};
