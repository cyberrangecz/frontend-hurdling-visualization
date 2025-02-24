import { LevelTypeEnum } from '../enums/level-type.enum';
import { Hint } from './hint';

export class Level {
    id: number;
    title: string;
    maxScore: number;
    levelType: LevelTypeEnum;
    estimatedDuration: number;
    order: number;
    content: string;
    answer: string;
    solution: string;
    solutionPenalized: boolean;
    hints: Hint[];
}
