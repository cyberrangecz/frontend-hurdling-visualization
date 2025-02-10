import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { getTimeString } from '../../../utils/utils';

@Component({
  selector: 'crczp-viz-hurdling-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnChanges {
  @Input() maximumTime = 100;
  @Input() timelineStepSize = 10;
  @Output() scaleRestrictionEvent = new EventEmitter<any>();
  @Output() restrictByTrainees = new EventEmitter<boolean>();
  @Output() restrictToTimeline = new EventEmitter<boolean>();

  public customRestrictedXScale = {
    min: 0,
    max: 100,
    minRestriction: 0,
    maxRestriction: 0,
  };
  public panelOpenState = false;
  public restrictToCustomTimelines = false;
  public restrictToVisibleTrainees = false;

  formatTime(seconds: number) {
    return getTimeString(seconds);
  }

  restrictTrainees() {
    this.restrictToVisibleTrainees = !this.restrictToVisibleTrainees;
    this.restrictByTrainees.emit(this.restrictToVisibleTrainees);
  }

  restrictCustom() {
    this.restrictToCustomTimelines = !this.restrictToCustomTimelines;
    this.restrictToTimeline.emit(this.restrictToCustomTimelines);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['maximumTime']) {
      this.customRestrictedXScale.max = this.maximumTime;
    }
  }

  updateVisibleTimeline(event: any, type: string) {
    let value: number = event;
    const restriction: { type: string; value: number } = {
      type: type,
      value: 0,
    };

    if (typeof event == 'object') {
      value = Number.parseInt(event.target.value);
    }
    switch (type) {
      case 'min':
        restriction.value = Number.parseInt(value.toFixed());
        break;
      case 'max':
        restriction.value = Number.parseInt((this.customRestrictedXScale.max - value).toFixed());
        break;
    }
    this.customRestrictedXScale[type + 'Restriction'] = restriction.value;
    this.scaleRestrictionEvent.emit(restriction);
  }
}
