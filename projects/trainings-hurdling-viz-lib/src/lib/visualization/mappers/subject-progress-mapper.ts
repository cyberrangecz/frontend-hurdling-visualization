import { SubjectProgressDTO } from '../DTOs/subject-progress-dto';
import { ProgressData } from '../models/progress-subject-progress-data';
import { SubjectLevelMapper } from './subject-level-mapper';

export class SubjectProgressMapper {
    static fromDTOs(dtos: SubjectProgressDTO[]): ProgressData[] {
        return dtos.map((dto) => SubjectProgressMapper.fromDTO(dto));
    }

    static fromDTO(dto: SubjectProgressDTO): ProgressData {
        const result = new ProgressData();
        result.id = dto.id;
        result.name = dto.name;
        result.picture = dto.picture;
        result.trainingRunId = dto.training_run_id;
        result.displayRun = true;
        result.levels = SubjectLevelMapper.fromDTOs(dto.levels);
        return result;
    }
}
