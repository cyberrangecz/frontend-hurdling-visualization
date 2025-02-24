import { Event } from './event';

export class WrongAnswerEvent extends Event {
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
