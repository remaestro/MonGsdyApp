import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChildListComponent } from './components/child-list/child-list.component';
import { ChildProfileComponent } from './components/child-profile/child-profile.component';

const routes: Routes = [
  {
    path: '',
    component: ChildListComponent
  },
  {
    path: ':id',
    component: ChildProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChildrenRoutingModule { }
