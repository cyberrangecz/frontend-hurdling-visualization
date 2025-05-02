import { EventDTO } from './event-dto';

export class SubjectLevelDTO {
    id: number;
    state: string;
    start_time: number;
    end_time: number;
    hints_taken: number[];
    wrong_answers_number: number;
    events: EventDTO[];
}
