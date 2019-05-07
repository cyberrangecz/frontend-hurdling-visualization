import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

const routes: Routes = [
  {
    path: 'hurdling',
    loadChildren: 'app/hurdling/hurdling.module#HurdlingModule',
  },
  {
    path: '',
    redirectTo: 'hurdling',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'hurdling'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
