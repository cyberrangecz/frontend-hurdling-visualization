import { GameData } from './game-data';
import { GenericObject } from './generic-object.type';

export class GameConfig {
	data: GameData;
	currentLevelColor: string;
	eventShapePaths: GenericObject;
	time: number;
}
