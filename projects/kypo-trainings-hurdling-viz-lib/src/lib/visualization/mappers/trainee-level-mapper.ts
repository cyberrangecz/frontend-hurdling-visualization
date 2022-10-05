import { TraineeLevelDTO } from '../DTOs/trainee-level-dto';
import { TraineeLevel } from '../models/trainee-level';
import { EventMapper } from './event-mapper';
import { HintMapper } from './hint-mapper';
import { ScoreMapper } from './score-mapper';

export class TraineeLevelMapper {
    static fromDTOs(dtos: TraineeLevelDTO[]): TraineeLevel[] {
        const result = dtos.map((dto) => TraineeLevelMapper.fromDTO(dto));
        return result;
    }

    static fromDTO(dto: TraineeLevelDTO): TraineeLevel {
        const result = new TraineeLevel;
        result.startTime = dto.start_time/1000;
        result.endTime = dto.end_time/1000;
        result.id = dto.id;
        result.state = dto.state;
        result.wrongAnswers_number = dto.wrong_answers_number;
        result.hintsTaken = dto.hints_taken;
        result.events = EventMapper.fromDTOs(dto.events);
        result.score = ScoreMapper.fromDTOs(dto.events)
        return result;
    }
}
