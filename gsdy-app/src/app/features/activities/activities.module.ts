import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivitiesRoutingModule } from './activities-routing.module';
import { ActivitiesListComponent } from './components/activities-list/activities-list.component';
import { ActivityDetailComponent } from './components/activity-detail/activity-detail.component';
import { ActivityRegistrationComponent } from './components/activity-registration/activity-registration.component';


@NgModule({
  declarations: [
    ActivitiesListComponent,
    ActivityDetailComponent,
    ActivityRegistrationComponent
  ],
  imports: [
    CommonModule,
    ActivitiesRoutingModule
  ]
})
export class ActivitiesModule { }
