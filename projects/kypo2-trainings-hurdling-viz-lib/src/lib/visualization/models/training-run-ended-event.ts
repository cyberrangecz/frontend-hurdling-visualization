import { Event } from "./event";

export class TrainingRunEndedEvent extends Event{
    
    constructor() {
        super();
      }

    getContent() {
        return '';
    }
}