import { Event } from './event';

export class TrainingDataEntry {
    playerId: number;
    playerName: string;
    playerAvatar: string;
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
