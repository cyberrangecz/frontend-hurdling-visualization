import { TraineeLevel } from './trainee-level';

export class TraineeProgress {
  userRefId: number;
  trainingRunId: number;
  displayRun: boolean;
  levels: TraineeLevel[];
}
