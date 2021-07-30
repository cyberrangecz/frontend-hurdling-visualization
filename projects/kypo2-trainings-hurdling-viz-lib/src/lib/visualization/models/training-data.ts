import { User } from '@sentinel/auth';
import { GenericObject } from './generic-object.type';
import { ProgressData } from './progress-data';

export class TrainingData {
	time: number;
	// types: string[];
	levels: GenericObject[];
	keys?: string[];
	trainingDataSet?: GenericObject[];
	planDataSet?: GenericObject[];
	levelsTimePlan?: number[];
	teams?: GenericObject[];
	participants?: User[];
}
