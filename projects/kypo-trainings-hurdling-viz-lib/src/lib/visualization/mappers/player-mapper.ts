import { PlayerDTO } from '../DTOs/player-dto';
import { Player } from '../models/player';
import {PlayerProgressDTO} from '../DTOs/player-progress-dto';

export class PlayerMapper {
    static fromDTOs(dtos: PlayerDTO[], progressPlayersDtos: PlayerProgressDTO[]): Player[] {
        const result = dtos.map((dto, index) => PlayerMapper.fromDTO(dto, progressPlayersDtos[index], index));
        return result;
    }

    static fromDTO(dto: PlayerDTO, progressPlayerDto: PlayerProgressDTO, index: number): Player {
        const result = new Player;
        result.teamIndex = index;
        result.name = dto.given_name + ' ' + dto.family_name;
        result.picture = dto.picture;
        result.userRefId = dto.user_ref_id;
        result.trainingRunId = progressPlayerDto ? progressPlayerDto.training_run_id : null;
        return result;
    }
}