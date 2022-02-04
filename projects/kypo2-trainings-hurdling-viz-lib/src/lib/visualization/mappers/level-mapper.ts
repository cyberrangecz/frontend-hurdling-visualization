import { LevelDTO } from '../DTOs/level-dto';
import { Level } from '../models/level';
import { LevelTypeEnum } from '../enums/level-type.enum'; 
import { HintMapper } from './hint-mapper';

export class LevelMapper {
    static fromDTOs(dtos: LevelDTO[]): Level[] {
      const result = dtos.map(dto => LevelMapper.fromDTO(dto));
      return result;
    }
  
    static fromDTO(dto: LevelDTO): Level {
      const result = new Level();
      result.id = dto.id;
      result.content = dto.content;
      result.estimatedDuration = dto.estimated_duration;
      result.answer = dto.answer;
      result.levelType = LevelMapper.levelTypeResolver(dto.level_type);
      result.maxScore = dto.max_score;
      result.order = dto.order;
      result.solution = dto.solution;
      result.solutionPenalized = dto.solution_penalized;
      result.title = dto.title;
      result.hints = HintMapper.fromDTOs(dto.hints);
      return result;
    }

    private static levelTypeResolver(levelTypeDTO): LevelTypeEnum {
      switch(levelTypeDTO) {
        case 'INFO_LEVEL': return LevelTypeEnum.Info;
        case 'ASSESSMENT_LEVEL': return LevelTypeEnum.Assessment;
        case 'TRAINING_LEVEL': return LevelTypeEnum.Training;
        case 'ACCESS_LEVEL': return LevelTypeEnum.Access;
      }
    }
  }
