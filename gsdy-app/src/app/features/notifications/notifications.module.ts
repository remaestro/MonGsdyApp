import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Composants
import { NotificationListComponent } from './components/notification-list/notification-list.component';

// Services
import { NotificationService } from './services/notification.service';

const routes: Routes = [
  { path: '', component: NotificationListComponent },
];

@NgModule({
  declarations: [
    NotificationListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    NotificationService
  ]
})
export class NotificationsFeatureModule { }
