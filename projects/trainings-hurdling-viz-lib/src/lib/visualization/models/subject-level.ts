import { ProgressEvent } from './progress-event';

export class SubjectLevel {
    id: number;
    state: string;
    startTime: number;
    endTime: number;
    hintsTaken: number[];
    wrongAnswers_number: number;
    events: ProgressEvent[];
    score: number;
}
