import { GenericObject } from './generic-object.type';

export class GameData {
	time: number;
	// types: string[];
	levels: GenericObject[];
	keys?: string[];
	gameDataset?: GenericObject[];
	planDataset?: GenericObject[];
	levelsTimePlan?: number[];
	teams?: GenericObject[];
}
