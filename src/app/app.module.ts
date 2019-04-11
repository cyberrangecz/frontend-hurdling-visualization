import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { Kypo2TrainingsHurdlingVizLibModule } from '../../projects/kypo2-trainings-hurdling-viz-lib/src/public_api';
import {HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    Kypo2TrainingsHurdlingVizLibModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
