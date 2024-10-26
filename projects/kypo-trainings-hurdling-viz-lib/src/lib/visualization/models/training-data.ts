import { User } from '@sentinel/auth';
import { GenericObject } from './generic-object.type';

export class TrainingData {
  time: number;
  levels: GenericObject[];
  keys?: string[];
  trainingDataSet?: GenericObject[];
  planDataSet?: GenericObject[];
  levelsTimePlan?: number[];
  teams?: GenericObject[];
  participants?: User[];
}
