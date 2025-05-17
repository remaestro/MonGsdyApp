import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module'; // Correction: s'assurer que le chemin est correct
import { AdminStudentsComponent } from './components/admin-students/admin-students.component';
import { StudentFormComponent } from './components/student-form/student-form.component';
import { BulkUploadComponent } from './components/bulk-upload/bulk-upload.component';
import { AdminCanteenComponent } from './components/admin-canteen/admin-canteen.component';
import { MenuPlannerComponent } from './components/menu-planner/menu-planner.component';
import { CanteenReportComponent } from './components/canteen-report/canteen-report.component';
import { AdminMessagingComponent } from './components/admin-messaging/admin-messaging.component';
import { MessageTemplateComponent } from './components/message-template/message-template.component';
import { BulkMessageComponent } from './components/bulk-message/bulk-message.component';
import { AdminStatsComponent } from './components/admin-stats/admin-stats.component';


@NgModule({
  declarations: [
    AdminStudentsComponent,
    StudentFormComponent,
    BulkUploadComponent,
    AdminCanteenComponent,
    MenuPlannerComponent,
    CanteenReportComponent,
    AdminMessagingComponent,
    MessageTemplateComponent,
    BulkMessageComponent,
    AdminStatsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
