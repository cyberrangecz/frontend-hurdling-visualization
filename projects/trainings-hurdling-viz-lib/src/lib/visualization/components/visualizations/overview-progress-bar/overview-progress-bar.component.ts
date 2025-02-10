import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { VisualizationData } from '../../../models/visualization-data';
import { TraineeProgress } from '../../../models/trainee-progress';
import { TrainingRunStartedEvent } from '../../../models/training-run-started-event';

@Component({
  selector: 'crczp-viz-hurdling-overview-progress-bar',
  templateUrl: './overview-progress-bar.component.html',
  styleUrls: ['./overview-progress-bar.component.css'],
})
export class OverviewProgressBarComponent implements OnInit, OnChanges {
  @Input() visualizationData: VisualizationData;

  startTime: Date;
  currentTime: Date;
  estimatedEndTime: Date;
  scheduledEndTime: Date;

  ngOnInit(): void {
    this.setScheduledEndTime();
    this.updateEstimatedEndTime();
  }

  ngOnChanges(): void {
    this.setStartTime();
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

  updateEstimatedEndTime(): void {
    this.estimatedEndTime = new Date(this.visualizationData.startTime * 1000);
    this.estimatedEndTime.setSeconds(this.estimatedEndTime.getSeconds() + this.getLongestEstimate());
    if (this.estimatedEndTime < this.scheduledEndTime) {
      this.estimatedEndTime = this.scheduledEndTime;
    }
  }

  setScheduledEndTime(): void {
    this.scheduledEndTime = new Date(this.visualizationData.estimatedEndTime * 1000);
  }

  getEstimatedTimeForLevels(): number {
    return this.visualizationData.levels.map((level) => level.estimatedDuration).reduce((a, b) => a + b, 0);
  }

  setStartTime(): void {
    this.startTime = new Date(this.visualizationData.startTime * 1000);
  }

  getTooltipInfo(): string {
    return (
      'Scheduled end time of training \n ' + this.scheduledEndTime.getHours() + ':' + this.scheduledEndTime.getMinutes()
    );
  }

  getTimeLeft(): string {
    const diff = this.estimatedEndTime.getTime() - this.currentTime.getTime();
    const diffHrs = Math.floor((diff % 86400000) / 3600000);
    const diffMins = Math.round(((diff % 86400000) % 3600000) / 60000);
    let res = '';
    if (diffHrs > 0) res = diffHrs === 1 ? diffHrs + ' hour ' : diffHrs + ' hours ';
    res = res.concat(diffMins === 1 ? diffMins + ' minute left' : diffMins + ' minutes left');
    return res;
  }

  updateCurrentTime(): void {
    this.currentTime = new Date(this.visualizationData.currentTime * 1000);
  }

  getLongestEstimate(): number {
    return this.visualizationData.traineeProgress
      .map((team) => this.getEstimateForTeam(team))
      .sort()
      .reverse()[0];
  }

  getEstimateForTeam(traineeProgressData: TraineeProgress): number {
    let estimatedTimeToFinish = 0;
    this.visualizationData.levels.forEach((level) => {
      if (!traineeProgressData.levels.find((traineeLevel) => traineeLevel.id === level.id)) {
        estimatedTimeToFinish += level.estimatedDuration;
      }
    });
    return this.visualizationData.currentTime - this.visualizationData.startTime + estimatedTimeToFinish * 60;
  }

  getStartEventTimestamp(team: TraineeProgress): number {
    return team.levels
      .reduce((accumulator, value) => accumulator.concat(value), [])
      .map((levels) => levels.events)
      .reduce((accumulator, value) => accumulator.concat(value), [])
      .find((event) => event instanceof TrainingRunStartedEvent).timestamp;
  }
}
