export class Event {
	hint_id: number;
	game_details: {
		player_id: number;
		player_name: string;
		level: number;
		logical_time: number;
		level_number: number;
	};
	name: string;
	type: string;
	timestamp: number;
	/*
	new format:
	*/
    /*player_login: string;
    level: number;
    actual_score_in_level: number;
    hint_id: number;
    type: string;
    level_type: string;
    answers: string[];
    timestamp: number;
    total_score: 60;
    hint_penalty_points: number;
    hint_title: string;
    */
}
