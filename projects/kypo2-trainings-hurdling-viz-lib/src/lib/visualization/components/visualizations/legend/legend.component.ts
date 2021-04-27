import {Component, Input, OnInit} from '@angular/core';
import {AppConfig} from '../../../../app.config';
import { View } from '../../../models/view.enum';

@Component({
  selector: 'kypo2-viz-hurdling-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  @Input() selectedViewValue = View.Progress;

  public pathConfig;

  constructor(private appConfig: AppConfig) {
    this.pathConfig = appConfig.eventShapePaths;
  }

  ngOnInit(): void {
  }

}
