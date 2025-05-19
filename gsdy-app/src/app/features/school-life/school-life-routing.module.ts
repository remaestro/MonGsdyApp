import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolLifeComponent } from './components/school-life/school-life.component';
import { HomeworkListComponent } from './components/homework-list/homework-list.component';
import { ScheduleComponent } from './components/schedule/schedule.component'; // Décommenter
import { ReportCardComponent } from './components/report-card/report-card.component';

const routes: Routes = [
  {
    path: '', // La route parente pour la vie scolaire, ex: /features/school-life/:childId
    component: SchoolLifeComponent,
    children: [
      { path: '', redirectTo: 'homework', pathMatch: 'full' }, // Redirection par défaut
      { path: 'homework', component: HomeworkListComponent },
      { path: 'schedule', component: ScheduleComponent }, // Décommenter
      { path: 'report-card', component: ReportCardComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolLifeRoutingModule { }
