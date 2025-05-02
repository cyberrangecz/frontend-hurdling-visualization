import { ProgressEvent } from './progress-event';

export class SolutionDisplayedEvent extends ProgressEvent {
    constructor() {
        super();
        this.type = 'solution';
    }

    getContent() {
        return 'Solution displayed';
    }
}
