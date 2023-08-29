import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { View } from '../../../models/view.enum';
import {timer} from "rxjs";
import {takeWhile} from "rxjs/operators";
import {D3, D3Service} from "@muni-kypo-crp/d3-service";

@Component({
  selector: 'kypo-viz-hurdling-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css'],
})
export class LegendComponent implements OnInit {
  @Input() selectedViewValue = View.Progress;

  @Output() zoomResetChange = new EventEmitter();

  private isAlive = true;
  private readonly d3: D3;

  public pathConfig: { [x: string]: any; };
  public activeLevelColorIndex = 3;
  public finishedLevelColorIndex = 0;
  public levelColors = {
    finished: this.appConfig.trainingColors[0],
    active: this.appConfig.levelsColorEstimates[0]
  };
  public activeLevelsDesc = [
    'the level duration is within estimates',
    'the level duration matches the expected time estimation',
    'the trainee is falling behind the schedule'
  ];

  constructor(private appConfig: AppConfig, d3Service: D3Service) {
    this.d3 = d3Service.getD3();
    this.pathConfig = {
      ...appConfig.shapes,
      ...appConfig.eventProps.eventShapes,
    };
  }

  ngOnInit() {
    this.initUpdateLevelColor();
  }

  initUpdateLevelColor() {
    timer(0, 5000)
        .pipe(takeWhile(() => this.isAlive))
        .subscribe(() => this.updateLevelColor())
  }

  updateLevelColor() {
    this.activeLevelColorIndex = (this.activeLevelColorIndex + 1) % this.appConfig.levelsColorEstimates.length;
    const newColor = this.appConfig.levelsColorEstimates[this.activeLevelColorIndex];
    this.levelColors.active = this.d3.hsl(newColor).brighter(1.2).toString();

    this.finishedLevelColorIndex = (this.finishedLevelColorIndex + 1) % this.appConfig.trainingColors.length;
    this.levelColors.finished = this.appConfig.trainingColors[this.finishedLevelColorIndex];
  }


  ngOnDestroy(): void {
    this.isAlive = false;
  }
}
