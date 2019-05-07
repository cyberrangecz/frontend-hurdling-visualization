import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

const routes: Routes = [
  {
    path: 'visualization',
    loadChildren: 'src/app/visualization/visualization.module#VisualizationModule',
  },
  {
    path: '',
    redirectTo: 'visualization',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'visualization'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
