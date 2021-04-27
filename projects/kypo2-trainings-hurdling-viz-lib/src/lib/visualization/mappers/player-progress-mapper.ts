import { PlayerProgressDTO } from '../DTOs/player-progress-dto';
import { PlayerProgress } from '../models/player-progress';
import { PlayerLevelMapper } from './player-level-mapper';

export class PlayerProgressMapper {
    static fromDTOs(dtos: PlayerProgressDTO[]): PlayerProgress[] {
        const result = dtos.map((dto) => PlayerProgressMapper.fromDTO(dto))
        return result;
    }

    static fromDTO(dto: PlayerProgressDTO): PlayerProgress {
        const result = new PlayerProgress();
        result.userRefId = dto.user_ref_id;
        result.levels = PlayerLevelMapper.fromDTOs(dto.levels);
        return result
    }
}