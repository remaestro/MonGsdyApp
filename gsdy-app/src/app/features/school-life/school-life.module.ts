import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule

import { SchoolLifeRoutingModule } from './school-life-routing.module';
import { SchoolLifeComponent } from './components/school-life/school-life.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { HomeworkListComponent } from './components/homework-list/homework-list.component';
import { ScheduleComponent } from './components/schedule/schedule.component'; // Ajouter ScheduleComponent
import { ReportCardComponent } from './components/report-card/report-card.component';
import { SharedModule } from '../../shared/shared.module'; // Import SharedModule
import { ChildrenModule } from '../children/children.module'; // Importer ChildrenModule

import { HomeworkService } from './services/homework.service';
import { GradesService } from './services/grades.service';
import { SchoolLifeService } from './services/school-life.service';

@NgModule({
  declarations: [
    SchoolLifeComponent,
    CalendarComponent,
    HomeworkListComponent,
    ScheduleComponent, // Ajouter ScheduleComponent
    ReportCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule, // Ajouter RouterModule aux imports
    SchoolLifeRoutingModule,
    SharedModule, // Ajouter SharedModule aux imports
    ChildrenModule // Ajouter ChildrenModule aux imports
  ],
  providers: [
    HomeworkService,
    GradesService,
    SchoolLifeService
  ]
})
export class SchoolLifeModule { }
