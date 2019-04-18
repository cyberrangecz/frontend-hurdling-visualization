import { GenericObject } from './visualization/models/generic-object.type';
import { View } from './visualization/models/view.enum';

export class AppConfig {
	apiUrl: string;
	token: string; // temp
	gameId: string;
	definitionId: string;
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

export const CTF_PROGRESS_CONFIG: AppConfig = {
    apiUrl: 'http://147.251.21.216:8083/kypo2-rest-training/api/v1',
	token: 'eyJqa3UiOiJodHRwczpcL1wvb2lkYy5pY3MubXVuaS5jelwvb2lkY1wvandrIiwia2lkIjoicnNhMSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzOTYyOTZAbXVuaS5jeiIsImF6cCI6IjU5M2JiZjQ5LWE4MmItNGY2ZS05YmFmLWM0ZWQ0ODhkNTA2NiIsImlzcyI6Imh0dHBzOlwvXC9vaWRjLmljcy5tdW5pLmN6XC9vaWRjXC8iLCJleHAiOjE1NTU1OTY0MDYsImlhdCI6MTU1NTU5MjgwNiwianRpIjoiMTE2NDI4MDMtNjIwNC00NGRhLWEzZTQtNmNkNDdiYWRlNTcwIn0.LmIYCw2UiioF5eNyzqBPAUJy36v1OBFRUm_1TrghahT_YpyLnTTMeuwPAJ9PnpCXnYszSL9ZZIqKjAP-S0CBIcym2uNOGXw5GN9DtbbSzLSJugzYJ_1ZEh1NV0FqMXJSkSXQzEISknhVkDK6jZF6uMxAeGB7bNaHgr7f9oLao7jHl0h8Caoy76HQFiHFo3eCbUlSCsrnhKszi6NrnsO9fWYXxZ62TcijKZvfSORP7H7hqqV6SFXJKxrN93ldjg3WIQ0-t6R48RINreSWg4rMW6aXb439VWmFpnCndQlT2MdP071M61CzvR1UsYa42jKpPjVe4kVVzhyEY5ugdiicaQ',
	gameId: '5',
    definitionId: '4',
	levelsTimePlan: [1200, 1500, 1900, 2100, 2200, 2200], // TODO remove hardcoded values
    gameColors: ['#1c89b8', '#20ac4c', '#ff9d3c', '#fc5248'],
	darkColor: '#2f2f2f',
	eventShapePaths: {
		'hint': 'M15,7.9c0,3.9-3.1,7-7,7c-3.9,0-7-3.1-7-7c0-3.9,3.1-7,7-7C11.9,0.9,15,4,15,7.9z',
		'skip': 'M3.4,0.9L8,5.5l4.7-4.6l2.3,2.2L10.4,8l4.7,4.7L12.9,15L8,10.2l-4.8,4.9l-2.4-2.3L5.6,8L0.9,3.5L3.4,0.9z',
		'solution' : 'M0.7,10.2l2-3L6,9.5l6.5-8.1l2.9,2.3L6.6,14.6L0.7,10.2z',
		'group' : 'M17.5,9c0,4.7-3.8,8.5-8.5,8.5c-4.7,0-8.5-3.8-8.5-8.5c0-4.7,3.8-8.5,8.5-8.5C13.7,0.5,17.5,4.3,17.5,9z',
		'wrong' : 'm13.442553,8.807937l3.19308,-5.361621c0.063743,-0.107093 0.067045,-0.241568 0.008917,-0.351781c-0.058458,-0.110213 ' +
		'-0.16877,-0.178487 -0.288989,-0.178487l-14.862288,0l0,-0.693166c0,-0.191658 -0.147632,-0.346581 -0.330273,-0.346581s-0.330273,' +
		'0.154923 -0.330273,0.346581l0,1.039747l0,10.050869l-0.030897,1.112352c-0.08162,0.722663 0.31874,0.474471 0.719104,0.468987l14.834628,' +
		'-0.195011c0.002642,0.000349 0.005284,0 0.006605,0c0.182641,0 0.330273,-0.154923 0.330273,-0.346581l-3.249887,-5.545308z'
	},
	minBarHeight: 18,
	maxBarHeight: 35,
	maxZoomValue: 10,
	zoomStep: 0.25,
	simulationInterval: 800,
	loadDataInterval: 5000,
	defaultView: View.overview
};
