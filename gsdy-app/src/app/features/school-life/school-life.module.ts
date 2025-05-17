import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SchoolLifeRoutingModule } from './school-life-routing.module';

import { CalendarComponent } from './components/calendar/calendar.component';
import { HomeworkListComponent } from './components/homework-list/homework-list.component';
import { ReportCardComponent } from './components/report-card/report-card.component';

import { HomeworkService } from './services/homework.service';
import { GradesService } from './services/grades.service';
import { SchoolLifeService } from './services/school-life.service';

@NgModule({
  declarations: [
    CalendarComponent,
    HomeworkListComponent,
    ReportCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SchoolLifeRoutingModule
  ],
  providers: [
    HomeworkService,
    GradesService,
    SchoolLifeService
  ]
})
export class SchoolLifeModule { }
