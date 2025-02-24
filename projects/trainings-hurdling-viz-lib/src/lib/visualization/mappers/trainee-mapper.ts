import { TraineeDTO } from '../DTOs/trainee-dto';
import { Trainee } from '../models/trainee';
import { TraineeProgressDTO } from '../DTOs/trainee-progress-dto';

export class TraineeMapper {
    static fromDTOs(dtos: TraineeDTO[], progressTraineesDTOs: TraineeProgressDTO[]): Trainee[] {
        const result = dtos.map((dto, index) => TraineeMapper.fromDTO(dto, progressTraineesDTOs[index], index));
        return result;
    }

    static fromDTO(dto: TraineeDTO, progressTraineeDTO: TraineeProgressDTO, index: number): Trainee {
        const result = new Trainee();
        result.teamIndex = index;
        result.name = dto.given_name + ' ' + dto.family_name;
        result.picture = dto.picture;
        result.userRefId = dto.user_ref_id;
        result.trainingRunId = progressTraineeDTO ? progressTraineeDTO.training_run_id : null;
        return result;
    }
}
