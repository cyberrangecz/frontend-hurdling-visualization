import { Level } from './level';
import { ProgressData } from './progress-subject-progress-data';

export class HurdlingVisualizationData {
    startTime: number;
    estimatedEndTime: number;
    currentTime: number;
    levels: Level[];
    progress: ProgressData[];
}
