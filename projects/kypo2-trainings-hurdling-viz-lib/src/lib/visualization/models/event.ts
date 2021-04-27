export abstract class Event {
    type: string;
    timestamp: number;
    gameTime: number;
    levelId: number;
    levelNumber: number;
    playerId: number;
    playerName: string;
    protected constructor(){};
    abstract getContent(): string
}