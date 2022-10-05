export class EventDTO {
    type: string;
    timestamp: number;
    training_time: number;
    level: number;
    answer_content?: string;
    hint_id?: number;
    hint_title?: string;
    actual_score_in_level?: number;
}
