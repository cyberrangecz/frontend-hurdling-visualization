import { HintDTO } from './hint-dto';

export class LevelDTO {
    id: number;
    title: string;
    max_score: number;
    level_type: string;
    estimated_duration: number;
    order: number;
    content: string;
    answer: string;
    solution: string;
    solution_penalized: boolean;
    hints: HintDTO[];
}
