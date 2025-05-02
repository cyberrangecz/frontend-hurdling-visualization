import { ProgressEvent } from './progress-event';

export class HintTakenEvent extends ProgressEvent {
    hintId: number;
    hintTitle: string;

    constructor() {
        super();
        this.type = 'hint';
    }

    getContent() {
        return 'Hint <i>' + this.hintTitle + '</i> taken';
    }
}
