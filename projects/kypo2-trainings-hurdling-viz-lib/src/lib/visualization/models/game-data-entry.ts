import { Event } from './event';

export class GameDataEntry {
    playerId: number;
    playerName: string;
    playerAvatar: string;
    events: Event[];
    eventGroups: [];
    flags: number;
    hints: number;
    totalTime: number;
    score: number;
    currentState: string;
    start: number;
}