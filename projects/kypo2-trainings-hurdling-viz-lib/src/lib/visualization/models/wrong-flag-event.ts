import { Event } from "./event";

export class WrongFlagEvent extends Event {
    type: string;
    flagContent: string;

    constructor() {
        super();
        this.type = 'wrong'
    }

    getContent() {
        return 'Wrong flag submitted: <i>' + this.flagContent + '</i>'
    }
}