import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {HurdlingOverviewComponent} from './hurdling-overview.component';
import {HurdlingRoutingModule} from './hurdling-routing.module';
import {CustomConfig} from '../custom-config';
import {Kypo2TrainingsHurdlingVizLibModule} from '../../../projects/kypo2-trainings-hurdling-viz-lib/src/public_api';

@NgModule({
  declarations: [
    HurdlingOverviewComponent
  ],
  imports: [
    CommonModule,
    HurdlingRoutingModule,
    Kypo2TrainingsHurdlingVizLibModule.forRoot(CustomConfig)
  ],
  exports: [
    HurdlingOverviewComponent
  ]
})
export class HurdlingModule {
}
