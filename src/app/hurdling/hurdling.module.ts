import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HurdlingOverviewComponent } from './hurdling-overview.component';
import { HurdlingRoutingModule } from './hurdling-routing.module';
import { CustomConfig } from '../custom-config';
import { TrainingsHurdlingVisualizationsModule } from '../../../projects/trainings-hurdling-viz-lib/src/public_api';

@NgModule({
    declarations: [
        HurdlingOverviewComponent
    ],
    imports: [
        CommonModule,
        HurdlingRoutingModule,
        TrainingsHurdlingVisualizationsModule.forRoot(CustomConfig)
    ],
    exports: [
        HurdlingOverviewComponent
    ]
})
export class HurdlingModule {
}
