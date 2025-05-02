import { LevelDTO } from './level-dto';
import { SubjectProgressDTO } from './subject-progress-dto';

export class VisualizationDataDTO {
    start_time: number;
    estimated_end_time: number;
    current_time: number;
    levels: LevelDTO[];
    progress: SubjectProgressDTO[];
}
