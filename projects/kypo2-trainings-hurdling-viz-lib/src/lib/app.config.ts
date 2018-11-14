import { GenericObject } from './visualization/models/generic-object.type';
import { View } from './visualization/models/view.enum';

export class AppConfig {
	apiUrl: string;
	gameId: string;
	levelsTimePlan: number[];
	gameColors: string[];
	planColors: string[];
	lightenedColors: string[];
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

export const CTF_PROGRESS_CONFIG: AppConfig = {
	apiUrl: 'https://ctfprogress-api.grex-pere.cz',
	gameId: '1',
	levelsTimePlan: [1200, 1500, 1900, 2100, 2200, 2200],
	gameColors: ['#307bc1', '#41ae43', '#ff9d3c', '#fc5248'],
	planColors: ['#155b8c', '#158136', '#ec7e26', '#d82f36'],
	lightenedColors: ['#bbdcea', '#bce6c9', '#ffe2c5', '#fecbc8'],
	darkColor: '#2f2f2f',
	eventShapePaths: {
		'hint': 'M15,7.9c0,3.9-3.1,7-7,7c-3.9,0-7-3.1-7-7c0-3.9,3.1-7,7-7C11.9,0.9,15,4,15,7.9z',
		'skip': 'M3.4,0.9L8,5.5l4.7-4.6l2.3,2.2L10.4,8l4.7,4.7L12.9,15L8,10.2l-4.8,4.9l-2.4-2.3L5.6,8L0.9,3.5L3.4,0.9z',
		'solution' : 'M0.7,10.2l2-3L6,9.5l6.5-8.1l2.9,2.3L6.6,14.6L0.7,10.2z',
		'group' : 'M17.5,9c0,4.7-3.8,8.5-8.5,8.5c-4.7,0-8.5-3.8-8.5-8.5c0-4.7,3.8-8.5,8.5-8.5C13.7,0.5,17.5,4.3,17.5,9z'
	},
	minBarHeight: 18,
	maxBarHeight: 35,
	maxZoomValue: 10,
	zoomStep: 0.25,
	simulationInterval: 800,
	loadDataInterval: 5000,
	defaultView: View.overview
};
