import { LevelDTO } from "./level-dto";
import { TraineeDTO } from "./trainee-dto";
import { TraineeProgressDTO } from "./trainee-progress-dto";

export class VisualizationDataDTO {
  start_time: number;
  estimated_end_time: number;
  current_time: number;
  players: TraineeDTO[];
  levels: LevelDTO[];
  player_progress: TraineeProgressDTO[];
}
