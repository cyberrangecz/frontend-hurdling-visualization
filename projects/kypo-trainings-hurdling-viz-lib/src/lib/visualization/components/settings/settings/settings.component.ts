import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {getTimeString} from '../../../utils/utils';
import {VisualizationData} from '../../../models/visualization-data';
import {Observable} from "rxjs";

@Component({
  selector: 'kypo-viz-hurdling-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnChanges {
  @Input() maximumTime = 100;
  @Input() timelineStepSize = 10;
  @Output() scaleRestrictionEvent = new EventEmitter<any>();
  @Output() restrictionTypeEvent = new EventEmitter<string>();

  public customRestrictedXScale = {
    min: 0,
    max: 100,
    minRestriction: 0,
    maxRestriction: 0,
  };
  public panelOpenState = false;
  public restrictToCustomTimelines = true;
  public restrictToVisibleTrainees = false;

  formatTime(seconds: number) {
    return getTimeString(seconds);
  }
  restrictView(viewType: string) {
    this[viewType] = !this[viewType];
    this.restrictionTypeEvent.emit(viewType);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['maximumTime']) {
      this.customRestrictedXScale.max = this.maximumTime;
    }
  }

  updateVisibleTimeline(event: any, type: string) {
    let value: number = event;
    const restriction : { type: string, value: number } = {type: type, value: 0};

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
