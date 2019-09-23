import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { Kypo2AuthGuardWithLogin, Kypo2AuthProviderPickerComponent, Kypo2NotAuthGuardService } from 'kypo2-auth';

const routes: Routes = [
  {
    path: 'hurdling',
    loadChildren: () => import('./hurdling/hurdling.module').then(m => m.HurdlingModule),
    canActivate: [Kypo2AuthGuardWithLogin],
  },
  {
    path: '',
    redirectTo: 'hurdling',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Kypo2AuthProviderPickerComponent,
    canActivate: [Kypo2NotAuthGuardService]
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
