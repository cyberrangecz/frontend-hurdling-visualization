import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {VisualizationOverviewComponent} from './visualization-overview.component';
import {VisualizationRoutingModule} from './visualization-routing.module';
import {CustomConfig} from '../custom-config';
import {Kypo2TrainingsVisualizationOverviewLibModule} from '../../../projects/kypo2-trainings-visualization-overview-lib/src/public_api';

@NgModule({
  declarations: [
    VisualizationOverviewComponent
  ],
  imports: [
    CommonModule,
    VisualizationRoutingModule,
    Kypo2TrainingsVisualizationOverviewLibModule.forRoot(CustomConfig)
  ],
  exports: [
    VisualizationOverviewComponent
  ]
})
export class VisualizationModule {
}
