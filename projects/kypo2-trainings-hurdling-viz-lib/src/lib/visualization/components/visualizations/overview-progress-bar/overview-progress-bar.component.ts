import { ProgressData } from '../../../models/progress-data';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { VisualizationData } from '../../../models/visualization-data';

@Component({
  selector: 'kypo2-viz-hurdling-overview-progress-bar',
  templateUrl: './overview-progress-bar.component.html',
  styleUrls: ['./overview-progress-bar.component.css']
})
export class OverviewProgressBarComponent implements OnInit, OnChanges {

  @Input() visualizationData: VisualizationData;

  startTime: Date;
  currentTime: Date;
  estimatedEndTime: Date;
  scheduledEndTime: Date;

  constructor() { }

  ngOnInit() {
    this.setStartTime();
    this.setScheduledEndTime();
    this.updateEstimatedEndTime();
  }

  ngOnChanges() {
    this.updateCurrentTime();
    this.updateEstimatedEndTime();
  }

  calculateScheduledPosition(): string {
    const q = this.scheduledEndTime.getTime() - this.startTime.getTime();
    const d = this.estimatedEndTime.getTime() - this.startTime.getTime();
    return 'calc(' + Math.round((q / d) * 100) + '% - 10px)';
  }

  calculateProgress(): number {
    const q = this.currentTime.getTime() - this.startTime.getTime();
    const d = this.estimatedEndTime.getTime() - this.startTime.getTime();
    return Math.round((q / d) * 100);
  }

  updateEstimatedEndTime() {
    this.estimatedEndTime = new Date(this.visualizationData.estimatedEndTime*1000);
  }

  setScheduledEndTime() {
    this.scheduledEndTime = new Date(this.visualizationData.startTime*1000);
    this.scheduledEndTime.setMinutes(this.scheduledEndTime.getMinutes() + this.getEstimatedTimeForLevels());
  }

  getEstimatedTimeForLevels() {
    return this.visualizationData.levels.map(level => level.estimatedDuration).reduce((a, b) => a + b, 0);
  }

  setStartTime() {
    this.startTime = new Date(this.visualizationData.startTime*1000);
  }

  getTooltipInfo(): string {
    return 'Scheduled end time of training \n ' + this.scheduledEndTime.getHours() + ':' + this.scheduledEndTime.getMinutes();
  }

  getTimeLeft(): string {
    const diff = (this.estimatedEndTime.getTime() - this.currentTime.getTime());
    const diffHrs = Math.floor((diff % 86400000) / 3600000);
    const diffMins = Math.round(((diff % 86400000) % 3600000) / 60000);
    let res = '';
    if(diffMins < 0)
      return 'Finished';
    if (diffHrs > 0)
      res = diffHrs === 1 ? diffHrs + ' hour ' : diffHrs + ' hours ';
    res = res.concat(diffMins === 1 ? diffMins + ' minute left' : diffMins + ' minutes left');
    return res;
  }

  updateCurrentTime() {
    this.currentTime = new Date(this.visualizationData.currentTime*1000);
  }


}
