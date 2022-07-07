import { LevelDTO } from './level-dto';
import { PlayerDTO } from './player-dto';
import { PlayerProgressDTO } from './player-progress-dto';

export class VisualizationDataDTO {
    start_time: number;
    estimated_end_time: number;
    current_time: number;
    players: PlayerDTO[];
    levels: LevelDTO[];
    player_progress: PlayerProgressDTO[];
}