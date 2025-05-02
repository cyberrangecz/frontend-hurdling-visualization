import { SubjectLevel } from './subject-level';

export class ProgressSubjectData {
    id: number;
    name: string;
    picture: string;
    trainingRunId: number;
    displayRun: boolean;
}

export class ProgressData extends ProgressSubjectData {
    levels: SubjectLevel[];
}
