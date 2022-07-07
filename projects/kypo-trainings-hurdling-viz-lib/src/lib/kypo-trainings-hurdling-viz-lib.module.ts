import { OverviewProgressBarComponent } from './visualization/components/visualizations/overview-progress-bar/overview-progress-bar.component';
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TrainingAnalysisComponent } from './visualization/components/visualizations/training-analysis/training-analysis.component';
import { MouseWheelDirective } from './visualization/directives/mousewheel.directive';
import { MouseMoveDirective } from './visualization/directives/mousemove.directive';
import { ColumnHeaderComponent } from './visualization/components/visualizations/column-header/column-header.component';
import { SortingService } from './visualization/services/sorting.service';
import { FilteringService } from './visualization/services/filtering.service';
import { ConfigService } from './visualization/config/config.service';
import { AppConfig, CTF_PROGRESS_CONFIG } from './app.config';
import { D3Service } from '@muni-kypo-crp/d3-service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlayerSelectionComponent } from './visualization/components/visualizations/player-selection/player-selection.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { LevelListComponent } from './visualization/components/visualizations/level-list/level-list.component';
import { LegendComponent } from './visualization/components/visualizations/legend/legend.component';
import { HurdlingVisualizationConfig } from './visualization/config/kypo-trainings-hurdling-viz-lib';
import { VisualizationDataApi } from './visualization/api/visualization-data-api.service';
import { VisualizationDataDefaultApi } from './visualization/api/visualization-data-default-api.service';
import { VisualizationsDataService } from './visualization/services/visualizations-data.service';
import { VisualizationsDataConcreteService } from './visualization/services/visualizations-data-concrete.service';
import { VisualizationsComponent } from './visualization/components/visualizations/visualizations.component';
import { PlayerDetailComponent } from './visualization/components/visualizations/player-detail/player-detail.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [
    TrainingAnalysisComponent,
    PlayerSelectionComponent,
    MouseWheelDirective,
    MouseMoveDirective,
    ColumnHeaderComponent,
    OverviewProgressBarComponent,
    LevelListComponent,
    LegendComponent,
    VisualizationsComponent,
    PlayerDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatGridListModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
  ],
  providers: [
    D3Service,
    SortingService,
    FilteringService,
    ConfigService,
    { provide: AppConfig, useValue: CTF_PROGRESS_CONFIG },
    { provide: VisualizationDataApi, useClass: VisualizationDataDefaultApi },
    { provide: VisualizationsDataService, useClass: VisualizationsDataConcreteService }
  ],
  exports: [
    TrainingAnalysisComponent,
    VisualizationsComponent,
    PlayerSelectionComponent
  ]
})
export class KypoTrainingsHurdlingVizLibModule {
  constructor(@Optional() @SkipSelf() parentModule: KypoTrainingsHurdlingVizLibModule) {
    if (parentModule) {
      throw new Error(
        'KypoTrainingsHurdlingVizLibModule is already loaded. Import it in the main module only');
    }
  }

  static forRoot(config: HurdlingVisualizationConfig): ModuleWithProviders<KypoTrainingsHurdlingVizLibModule> {
    return {
      ngModule: KypoTrainingsHurdlingVizLibModule,
      providers: [
        {provide: HurdlingVisualizationConfig, useValue: config}
      ]
    };
  }
}
