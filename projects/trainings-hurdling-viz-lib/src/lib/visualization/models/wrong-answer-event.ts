import { ProgressEvent } from './progress-event';

export class WrongAnswerEvent extends ProgressEvent {
    type: string;
    answerContent: string;

    constructor() {
        super();
        this.type = 'wrong';
    }

    getContent() {
        return 'Wrong answer submitted: <i>' + this.answerContent + '</i>';
    }
}
