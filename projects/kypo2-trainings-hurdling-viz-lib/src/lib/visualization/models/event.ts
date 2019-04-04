export class Event {
	hint_id: number;
	game_details: {
		player_id: string;
		level: number;
		logical_time: number;
	}
	type: string;
	timestamp: number;
}
