import { Event } from './event';

export class SolutionDisplayedEvent extends Event {
  constructor() {
    super();
    this.type = 'solution';
  }

  getContent() {
    return 'Solution displayed';
  }
}
