import { PlayerDTO } from '../DTOs/player-dto';
import { Player } from '../models/player';

export class PlayerMapper {
    static fromDTOs(dtos: PlayerDTO[]): Player[] {
        const result = dtos.map((dto) => PlayerMapper.fromDTO(dto));
        return result;
    }

    static fromDTO(dto: PlayerDTO): Player {
        const result = new Player;
        result.name = dto.given_name + ' ' + dto.family_name;
        result.picture = dto.picture;
        result.userRefId = dto.user_ref_id;
        return result;
    }
}