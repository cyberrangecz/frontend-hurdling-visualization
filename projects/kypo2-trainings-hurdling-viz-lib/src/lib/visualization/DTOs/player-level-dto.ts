import { EventDTO } from './event-dto';
import { HintDTO } from './hint-dto';

export class PlayerLevelDTO {
    id: number;
    state: string;
    start_time: number;
    end_time: number;
    hints_taken: number[];
    wrong_flags_number: number;
    events: EventDTO[];
  }