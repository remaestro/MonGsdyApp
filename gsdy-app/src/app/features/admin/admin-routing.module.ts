import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminStudentsComponent } from './components/admin-students/admin-students.component';
import { StudentFormComponent } from './components/student-form/student-form.component';
import { AdminCanteenComponent } from './components/admin-canteen/admin-canteen.component';
import { MenuPlannerComponent } from './components/menu-planner/menu-planner.component';
import { AdminMessagingComponent } from './components/admin-messaging/admin-messaging.component';
import { AdminStatsComponent } from './components/admin-stats/admin-stats.component';

const routes: Routes = [
  { path: 'students', component: AdminStudentsComponent },
  { path: 'students/add', component: StudentFormComponent }, // Route pour ajouter un étudiant
  { path: 'students/:studentId', component: StudentFormComponent }, // Route pour modifier un étudiant
  { path: 'canteen', component: AdminCanteenComponent },
  { path: 'canteen/menu-planner', component: MenuPlannerComponent }, // Route pour le planificateur de menu
  { path: 'communications', component: AdminMessagingComponent },
  { path: 'statistics', component: AdminStatsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
