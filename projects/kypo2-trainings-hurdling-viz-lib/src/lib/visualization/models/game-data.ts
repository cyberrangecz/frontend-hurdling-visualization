import { User } from '@sentinel/auth';
import { GenericObject } from './generic-object.type';
import { ProgressData } from './progress-data';

export class GameData {
	time: number;
	// types: string[];
	levels: GenericObject[];
	keys?: string[];
	gameDataset?: GenericObject[];
	planDataset?: GenericObject[];
	levelsTimePlan?: number[];
	teams?: GenericObject[];
	participants?: User[];
}
