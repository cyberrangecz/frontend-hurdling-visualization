import { HintDTO } from '../DTOs/hint-dto';
import { Hint } from '../models/hint';

export class HintMapper {
    static fromDTOs(dtos: HintDTO[]): Hint[] {
        const result = dtos ? dtos.map((dto) => HintMapper.fromDTO(dto)) : [];
        return result;
    }

    static fromDTO(dto: HintDTO): Hint {
        const result = new Hint();
        result.id = dto.hint_id;
        result.title = dto.hint_title;
        result.content = dto.hint_content;
        return result;
    }
}
