import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HurdlingOverviewComponent } from './hurdling-overview.component';
import { HurdlingRoutingModule } from './hurdling-routing.module';
import { TrainingsHurdlingVisualizationsModule } from '../../../projects/trainings-hurdling-viz-lib/src/public_api';
import { environment } from '../../environments/environment';

@NgModule({
    declarations: [
        HurdlingOverviewComponent
    ],
    imports: [
        CommonModule,
        HurdlingRoutingModule,
        TrainingsHurdlingVisualizationsModule.forRoot(environment)
    ],
    exports: [
        HurdlingOverviewComponent
    ]
})
export class HurdlingModule {
}
