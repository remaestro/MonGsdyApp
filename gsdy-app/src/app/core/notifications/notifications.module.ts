import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';
import { NotificationBadgeComponent } from './components/notification-badge/notification-badge.component';



@NgModule({
  declarations: [
    ToastComponent,
    NotificationBadgeComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ToastComponent,
    NotificationBadgeComponent
  ]
})
export class NotificationsModule { }
