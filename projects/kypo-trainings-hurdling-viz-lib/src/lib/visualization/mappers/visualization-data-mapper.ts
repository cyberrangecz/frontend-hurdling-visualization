import { VisualizationDataDTO } from '../DTOs/visualization-data-dto';
import { VisualizationData } from '../models/visualization-data';
import { LevelMapper } from './level-mapper';
import { TraineeMapper } from './trainee-mapper';
import { TraineeProgressMapper } from './trainee-progress-mapper';

export class VisualizationDataMapper {
  static fromDTO(dto: VisualizationDataDTO): VisualizationData {
    const result = new VisualizationData();
    result.startTime = dto.start_time;
    result.estimatedEndTime = dto.estimated_end_time;
    result.currentTime = dto.current_time;
    result.levels = LevelMapper.fromDTOs(dto.levels);
    result.trainees = TraineeMapper.fromDTOs(dto.players, dto.player_progress);
    result.traineeProgress = TraineeProgressMapper.fromDTOs(dto.player_progress);
    return result;
  }
}

