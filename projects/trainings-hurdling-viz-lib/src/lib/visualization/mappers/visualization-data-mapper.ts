import { VisualizationDataDTO } from '../DTOs/visualization-data-dto';
import { HurdlingVisualizationData } from '../models/hurdling-visualization-data';
import { LevelMapper } from './level-mapper';
import { SubjectProgressMapper } from './subject-progress-mapper';

export class VisualizationDataMapper {
    static fromDTO(dto: VisualizationDataDTO): HurdlingVisualizationData {
        const result = new HurdlingVisualizationData();
        result.startTime = dto.start_time;
        result.estimatedEndTime = dto.estimated_end_time;
        result.currentTime = dto.current_time;
        result.levels = LevelMapper.fromDTOs(dto.levels);
        result.progress = SubjectProgressMapper.fromDTOs(dto.progress);
        return result;
    }
}
