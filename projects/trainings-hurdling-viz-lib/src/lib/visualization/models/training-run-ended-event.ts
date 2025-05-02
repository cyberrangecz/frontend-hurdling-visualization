import { ProgressEvent } from './progress-event';

export class TrainingRunEndedEvent extends ProgressEvent {
    constructor() {
        super();
    }

    getContent() {
        return '';
    }
}
