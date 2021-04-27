import { Level } from './level';
import { Player } from './player';
import { PlayerProgress } from './player-progress';

export class VisualizationData {
    startTime: number;
    estimatedEndTime: number;
    currentTime: number;
    players: Player[];
    levels: Level[];
    playerProgress: PlayerProgress[];
}