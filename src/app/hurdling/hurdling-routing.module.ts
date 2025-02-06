import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HurdlingOverviewComponent } from './hurdling-overview.component';

const routes: Routes = [
    {
        path: '',
        component: HurdlingOverviewComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HurdlingRoutingModule {

}
