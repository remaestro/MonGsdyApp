import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

// Importer ParentDashboardModule pour avoir accès à DashboardCardComponent
import { ParentDashboardModule } from '../parent-dashboard/parent-dashboard.module';

// Import NgxChartsModule
import { NgxChartsModule } from '@swimlane/ngx-charts';

// Import BrowserAnimationsModule
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Import SharedModule if you have common components/pipes/directives used here
// import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    AdminDashboardComponent
  ],
  imports: [
    CommonModule, // Assurez-vous que CommonModule est bien ici
    RouterModule, // Pour routerLink, ngClass, date pipe
    AdminDashboardRoutingModule,
    ParentDashboardModule, // Pour DashboardCardComponent
    NgxChartsModule, // Ajouter NgxChartsModule aux imports
    // SharedModule // Décommenter si SharedModule est créé et nécessaire
    // BrowserAnimationsModule // BrowserAnimationsModule est généralement importé dans AppModule
  ]
})
export class AdminDashboardModule { }
