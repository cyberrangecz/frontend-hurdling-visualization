import {
  Directive,
  Output,
  HostListener,
  EventEmitter,
  ElementRef,
} from "@angular/core";

@Directive({ selector: "[mouseWheel]" })
export class MouseWheelDirective {
  @Output() mouseWheelUp = new EventEmitter();
  @Output() mouseWheelDown = new EventEmitter();

  @HostListener("mousewheel", ["$event"]) onMouseWheelChrome(event: any) {
    this.mouseWheelFunc(event);
  }

  @HostListener("DOMMouseScroll", ["$event"]) onMouseWheelFirefox(event: any) {
    this.mouseWheelFunc(event);
  }

  @HostListener("onmousewheel", ["$event"]) onMouseWheelIE(event: any) {
    this.mouseWheelFunc(event);
  }

  constructor(public element: ElementRef) {}

  mouseWheelFunc(event: any) {
    var event = window.event || event;
    var delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
    var pos: any = {
      top:
        event.clientY - this.element.nativeElement.getBoundingClientRect().top,
      left:
        event.clientX - this.element.nativeElement.getBoundingClientRect().left,
    };
    if (typeof event.ctrlKey === "undefined" || event.ctrlKey !== true) {
      return;
    }
    if (delta > 0) {
      this.mouseWheelUp.emit(pos);
    } else if (delta < 0) {
      this.mouseWheelDown.emit(pos);
    }
    // for IE
    event.returnValue = false;
    // for Chrome and Firefox
    if (event.preventDefault) {
      event.preventDefault();
    }
  }
}
