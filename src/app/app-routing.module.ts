import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import {SentinelAuthProviderListComponent} from '@sentinel/auth/components';
import {SentinelAuthGuardWithLogin, SentinelNegativeAuthGuard} from '@sentinel/auth/guards';

const routes: Routes = [
  {
    path: 'hurdling',
    loadChildren: () => import('./hurdling/hurdling.module').then(m => m.HurdlingModule),
    // canActivate: [SentinelAuthGuardWithLogin],
  },
  {
    path: '',
    redirectTo: 'hurdling',
    pathMatch: 'full'
  },
  // {
  //   path: 'login',
  //   component: SentinelAuthProviderListComponent,
  //   canActivate: [SentinelNegativeAuthGuard]
  // },
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
