import { VisualizationDataDTO } from '../DTOs/visualization-data-dto';
import { VisualizationData } from '../models/visualization-data';
import { LevelMapper } from './level-mapper';
import { PlayerMapper } from './player-mapper';
import { PlayerProgressMapper } from './player-progress-mapper';

export class VisualizationDataMapper {
  static fromDTO(dto: VisualizationDataDTO): VisualizationData {
    const result = new VisualizationData();
    result.startTime = dto.start_time;
    result.estimatedEndTime = dto.estimated_end_time;
    result.currentTime = dto.current_time;
    result.levels = LevelMapper.fromDTOs(dto.levels);
    result.players = PlayerMapper.fromDTOs(dto.players, dto.player_progress);
    result.playerProgress = PlayerProgressMapper.fromDTOs(dto.player_progress);
    return result;
  }
}

