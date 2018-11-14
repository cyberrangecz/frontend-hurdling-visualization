import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { Kypo2TrainingsHurdlingVizLibModule } from '../../projects/kypo2-trainings-hurdling-viz-lib/src/public_api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    Kypo2TrainingsHurdlingVizLibModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
