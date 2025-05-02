import { ProgressEvent } from './progress-event';

export class TrainingRunStartedEvent extends ProgressEvent {
    constructor() {
        super();
    }

    getContent() {
        return '';
    }
}
