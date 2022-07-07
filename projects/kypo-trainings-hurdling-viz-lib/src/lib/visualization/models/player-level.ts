import { Event } from './event';
import { Hint } from './hint';

export class PlayerLevel {
    id: number;
    state: string;
    startTime: number;
    endTime: number;
    hintsTaken: number[];
    wrongAnswers_number: number;
    events: Event[];
    score: number;
  }
