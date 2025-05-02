import { SubjectLevelDTO } from './subject-level-dto';

export class SubjectProgressDTO {
    id: number;
    name: string;
    picture: string;
    training_run_id: number;
    levels: SubjectLevelDTO[];
}
