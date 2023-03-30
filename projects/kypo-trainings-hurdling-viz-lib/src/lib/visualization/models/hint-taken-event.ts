import { Event } from "./event";

export class HintTakenEvent extends Event {
  hintId: number;
  hintTitle: string;

  constructor() {
    super();
    this.type = "hint";
  }

  getContent() {
    return "Hint <i>" + this.hintTitle + "</i> taken";
  }
}
