export abstract class Event {
    type: string;
    timestamp: number;
    trainingTime: number;
    levelId: number;
    levelNumber: number;
    traineeId: number;
    traineeName: string;
    protected constructor(){};
    abstract getContent(): string
}
