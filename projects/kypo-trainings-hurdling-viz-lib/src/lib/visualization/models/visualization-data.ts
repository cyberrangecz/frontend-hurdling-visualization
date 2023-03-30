import { Level } from "./level";
import { Trainee } from "./trainee";
import { TraineeProgress } from "./trainee-progress";

export class VisualizationData {
  startTime: number;
  estimatedEndTime: number;
  currentTime: number;
  trainees: Trainee[];
  levels: Level[];
  traineeProgress: TraineeProgress[];
}
