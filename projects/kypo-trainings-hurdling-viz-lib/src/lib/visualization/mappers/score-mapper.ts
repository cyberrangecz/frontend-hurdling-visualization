import { EventDTO } from "../DTOs/event-dto";
import { EventType } from "../models/enums/event-type.enum";


export class ScoreMapper {
    static fromDTOs(dtos: EventDTO[]): number {
        const result = dtos.find(dto => dto.type === EventType.levelCompleted)?.actual_score_in_level;
        return result ? result : 0;
    }
}