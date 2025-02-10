import { Event } from './event';

export class TrainingRunStartedEvent extends Event {
  constructor() {
    super();
  }

  getContent() {
    return '';
  }
}
