import { ProgressEvent } from './progress-event';

export class TrainingDataEntry {
    subjectId: number;
    subjectName: string;
    subjectAvatar: string;
    events: ProgressEvent[];
    eventGroups: [];
    answers: number;
    hints: number;
    totalTime: number;
    score: number;
    currentState: string;
    start: number;
    trainingRunId: number;
}
