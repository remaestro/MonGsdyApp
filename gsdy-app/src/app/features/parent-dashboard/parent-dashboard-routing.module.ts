import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParentDashboardComponent } from './components/parent-dashboard/parent-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: ParentDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParentDashboardRoutingModule { }
