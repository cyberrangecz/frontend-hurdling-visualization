export class EventDTO {
    type: string;
    timestamp: number;
    game_time: number;
    level: number
    flag_content?: string;
    hint_id?: number;
    hint_title?: string;
    actual_score_in_level?: number;
}