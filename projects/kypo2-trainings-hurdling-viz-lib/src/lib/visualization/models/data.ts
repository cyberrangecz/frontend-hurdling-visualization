import { GenericObject } from './generic-object.type';

export class Data {
	time: number;
	types: string[];
	levels: string[];
	gameDataset: GenericObject[];
	planDataset: GenericObject[];
	levelsTimePlan: number[];
}
