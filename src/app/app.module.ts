import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppConfig, CTF_PROGRESS_CONFIG } from './app.config';

import { AppComponent } from './app.component';
import { D3Service } from 'd3-ng2-service';
import { PapaParseModule } from 'ngx-papaparse';
import { LoadDataService } from './visualization/services/load-data.service';
import { LoadCsvDataService } from './visualization/services/load-csv-data.service';
import { GameAnalysisComponent } from './visualization/components/game-analysis/game-analysis.component';
import { MouseWheelDirective } from './visualization/directives/mousewheel.directive';
import { MouseMoveDirective } from './visualization/directives/mousemove.directive';
import { ColumnHeaderComponent } from './visualization/components/column-header/column-header.component';
import { SortingService } from './visualization/services/sorting.service';

@NgModule({
  declarations: [
    AppComponent,
    GameAnalysisComponent,
    MouseWheelDirective,
    MouseMoveDirective,
    ColumnHeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    PapaParseModule
  ],
  providers: [
    D3Service,
    LoadDataService,
    LoadCsvDataService,
    { provide: AppConfig, useValue: CTF_PROGRESS_CONFIG },
    SortingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
