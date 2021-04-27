import { PlayerLevelDTO } from './player-level-dto';

export class PlayerProgressDTO {
    user_ref_id: number;
    levels: PlayerLevelDTO[];
  }