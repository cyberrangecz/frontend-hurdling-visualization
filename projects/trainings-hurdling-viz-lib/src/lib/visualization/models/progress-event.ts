export abstract class ProgressEvent {
    type: string;
    timestamp: number;
    trainingTime: number;
    levelId: number;
    levelNumber: number;
    subjectId: number;
    subjectName: string;

    protected constructor() {}

    abstract getContent(): string;
}
