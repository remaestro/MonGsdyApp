import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ParentDashboardRoutingModule } from './parent-dashboard-routing.module';
import { ParentDashboardComponent } from './components/parent-dashboard/parent-dashboard.component';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { WeeklyPlanningComponent } from './components/weekly-planning/weekly-planning.component';
import { LatestMessagesComponent } from './components/latest-messages/latest-messages.component';

// Import SharedModule if you have common components/pipes/directives used here
// import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ParentDashboardComponent,
    DashboardCardComponent,
    WeeklyPlanningComponent,
    LatestMessagesComponent
  ],
  imports: [
    CommonModule,
    RouterModule, // Needed for routerLink in templates
    ParentDashboardRoutingModule,
    // SharedModule // Uncomment if SharedModule is created and needed
  ],
  exports: [
    DashboardCardComponent // Exporter DashboardCardComponent pour l'utiliser ailleurs
  ]
})
export class ParentDashboardModule { }
