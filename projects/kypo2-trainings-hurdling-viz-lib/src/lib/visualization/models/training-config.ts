import { TrainingData } from './training-data';
import { GenericObject } from './generic-object.type';

export class TrainingConfig {
	data: TrainingData;
	currentLevelColor: string;
	eventShapePaths: GenericObject;
	time: number;
}
