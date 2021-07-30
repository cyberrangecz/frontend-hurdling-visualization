import { EventDTO } from '../DTOs/event-dto';
import { EventType } from '../models/enums/event-type.enum';
import { Event} from '../models/event';
import { HintTakenEvent } from '../models/hint-taken-event';
import { SolutionDisplayedEvent } from '../models/solution-displayed-event';
import { TrainingRunEndedEvent } from '../models/training-run-ended-event';
import { TrainingRunStartedEvent } from '../models/training-run-started-event';
import { WrongAnswerEvent } from '../models/wrong-answer-event';

export class EventMapper {
    static fromDTOs(dtos: EventDTO[]): Event[] {
        const result = dtos.map((dto) => EventMapper.fromDTO(dto)).filter(event => event);
        return result;
    }

    static fromDTO(dto: EventDTO): Event {
        return EventMapper.eventResolver(dto);
    }

    private static eventResolver(dto: EventDTO): Event {
        let event; 
        switch(dto.type) {
            case EventType.hint: {
                event = new HintTakenEvent();
                event.hintId = dto.hint_id;
                event.hintTitle = dto.hint_title;
                break;
            }
            case EventType.wrongAnswer: {
                event = new WrongAnswerEvent();
                event.answerContent = dto.answer_content;
                break;
            }
            case EventType.wrongFlag: {
                event = new WrongAnswerEvent();
                event.answerContent = dto.answer_content;
                break;
            }
            case EventType.solution: {
                event = new SolutionDisplayedEvent();
                break;
            }
            case EventType.trainingFinished: {
                event = new TrainingRunEndedEvent();
                break;
            }
            case EventType.trainingStart: {
                event = new TrainingRunStartedEvent();
                break;
            }
            default: {
                return;
            }
        }
        event.timestamp = dto.timestamp/1000;
        event.trainingTime = dto.training_time/1000;
        event.levelId = dto.level;
        return event;
    }

}
