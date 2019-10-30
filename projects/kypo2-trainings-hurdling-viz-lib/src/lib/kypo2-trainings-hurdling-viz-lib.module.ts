import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {CommonModule} from '@angular/common';
import { D3Service } from 'd3-ng2-service';
import { PapaParseModule } from 'ngx-papaparse';
import { LoadDataService } from './visualization/services/load-data.service';
import { GameAnalysisComponent } from './visualization/components/game-analysis/game-analysis.component';
import { MouseWheelDirective } from './visualization/directives/mousewheel.directive';
import { MouseMoveDirective } from './visualization/directives/mousemove.directive';
import { ColumnHeaderComponent } from './visualization/components/column-header/column-header.component';
import { SortingService } from './visualization/services/sorting.service';
import { FilteringService } from './visualization/services/filtering.service';
import { Kypo2TrainingsHurdlingVizLibConfig } from './visualization/config/kypo2-trainings-hurdling-viz-lib';
import {ConfigService} from './visualization/config/config.service';
import {AppConfig, CTF_PROGRESS_CONFIG} from './app.config';

@NgModule({
  declarations: [
    GameAnalysisComponent,
    MouseWheelDirective,
    MouseMoveDirective,
    ColumnHeaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PapaParseModule
  ],
  providers: [
    D3Service,
    LoadDataService,
    SortingService,
    FilteringService,
    ConfigService,
    { provide: AppConfig, useValue: CTF_PROGRESS_CONFIG }
  ],
  exports: [
    GameAnalysisComponent
  ]
})
export class Kypo2TrainingsHurdlingVizLibModule {
  constructor(@Optional() @SkipSelf() parentModule: Kypo2TrainingsHurdlingVizLibModule) {
    if (parentModule) {
      throw new Error(
          'Kypo2TrainingsHurdlingVizLibModule is already loaded. Import it in the main module only');
    }
  }

  static forRoot(config: Kypo2TrainingsHurdlingVizLibModule): ModuleWithProviders {
    return {
      ngModule: Kypo2TrainingsHurdlingVizLibModule,
      providers: [
        {provide: Kypo2TrainingsHurdlingVizLibConfig, useValue: config}
      ]
    };
  }
}
