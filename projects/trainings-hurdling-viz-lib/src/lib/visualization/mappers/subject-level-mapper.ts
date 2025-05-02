import { SubjectLevelDTO } from '../DTOs/subject-level-dto';
import { SubjectLevel } from '../models/subject-level';
import { EventMapper } from './event-mapper';
import { ScoreMapper } from './score-mapper';

export class SubjectLevelMapper {
    static fromDTOs(dtos: SubjectLevelDTO[]): SubjectLevel[] {
        const result = dtos.map((dto) => SubjectLevelMapper.fromDTO(dto));
        return result;
    }

    static fromDTO(dto: SubjectLevelDTO): SubjectLevel {
        const result = new SubjectLevel();
        result.startTime = dto.start_time / 1000;
        result.endTime = dto.end_time / 1000;
        result.id = dto.id;
        result.state = dto.state;
        result.wrongAnswers_number = dto.wrong_answers_number;
        result.hintsTaken = dto.hints_taken;
        result.events = EventMapper.fromDTOs(dto.events);
        result.score = ScoreMapper.fromDTOs(dto.events);
        return result;
    }
}
