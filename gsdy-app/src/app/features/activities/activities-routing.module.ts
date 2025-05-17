import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivitiesListComponent } from './components/activities-list/activities-list.component';
import { ActivityDetailComponent } from './components/activity-detail/activity-detail.component';
import { ActivityRegistrationComponent } from './components/activity-registration/activity-registration.component'; // Ajout du composant d'inscription

const routes: Routes = [
  { path: '', component: ActivitiesListComponent },
  { path: ':activityId', component: ActivityDetailComponent },
  { path: ':activityId/register', component: ActivityRegistrationComponent } // Route pour l'inscription à une activité
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivitiesRoutingModule { }
