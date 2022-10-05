import { Event } from './event';

export class TrainingDataEntry {
    traineeId: number;
    traineeName: string;
    traineeAvatar: string;
    events: Event[];
    eventGroups: [];
    answers: number;
    hints: number;
    totalTime: number;
    score: number;
    currentState: string;
    start: number;
    trainingRunId: number;
    teamIndex: number;
}
