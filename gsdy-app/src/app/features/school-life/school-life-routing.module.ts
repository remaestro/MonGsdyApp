import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './components/calendar/calendar.component';
import { HomeworkListComponent } from './components/homework-list/homework-list.component';
import { ReportCardComponent } from './components/report-card/report-card.component';

const routes: Routes = [
  {
    path: 'calendar',
    component: CalendarComponent
  },
  {
    path: 'homework',
    component: HomeworkListComponent
  },
  {
    path: 'grades',
    component: ReportCardComponent
  },
  {
    path: '',
    redirectTo: 'calendar', // Default view for school-life of a child
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolLifeRoutingModule { }
