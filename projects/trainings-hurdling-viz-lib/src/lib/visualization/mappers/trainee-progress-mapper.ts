import { TraineeProgressDTO } from '../DTOs/trainee-progress-dto';
import { TraineeProgress } from '../models/trainee-progress';
import { TraineeLevelMapper } from './trainee-level-mapper';

export class TraineeProgressMapper {
    static fromDTOs(dtos: TraineeProgressDTO[]): TraineeProgress[] {
        const result = dtos.map((dto) => TraineeProgressMapper.fromDTO(dto));
        return result;
    }

    static fromDTO(dto: TraineeProgressDTO): TraineeProgress {
        const result = new TraineeProgress();
        result.userRefId = dto.user_ref_id;
        result.trainingRunId = dto.training_run_id;
        result.displayRun = true;
        result.levels = TraineeLevelMapper.fromDTOs(dto.levels);
        return result;
    }
}
