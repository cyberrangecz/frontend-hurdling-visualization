import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AppConfig} from '../../../../app.config';
import { View } from '../../../models/view.enum';

@Component({
  selector: 'kypo-viz-hurdling-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  @Input() selectedViewValue = View.Progress;

  @Output() zoomResetChange = new EventEmitter();

  public pathConfig;

  constructor(private appConfig: AppConfig) {
    this.pathConfig = { ...appConfig.shapes, ...appConfig.eventProps.eventShapes }
  }

  ngOnInit(): void {
  }

}
