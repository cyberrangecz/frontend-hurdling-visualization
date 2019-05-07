import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {VisualizationOverviewComponent} from './visualization-overview.component';

const routes: Routes = [
  {
    path: '',
    component: VisualizationOverviewComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisualizationRoutingModule {

}
