import { PlayerLevelDTO } from './player-level-dto';

export class PlayerProgressDTO {
    user_ref_id: number;
    training_run_id: number;
    levels: PlayerLevelDTO[];
  }