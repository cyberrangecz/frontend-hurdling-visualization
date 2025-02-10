import { Event } from './event';

export class TraineeLevel {
  id: number;
  state: string;
  startTime: number;
  endTime: number;
  hintsTaken: number[];
  wrongAnswers_number: number;
  events: Event[];
  score: number;
}
