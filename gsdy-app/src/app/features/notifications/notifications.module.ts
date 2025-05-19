import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsListComponent } from './components/notifications-list/notifications-list.component';
import { NotificationService } from './services/notification.service';

// Importations des modules partagés ou des dépendances nécessaires
// import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    NotificationsListComponent,
    // Autres composants liés aux notifications
  ],
  imports: [
    CommonModule,
    RouterModule,
    NotificationsRoutingModule,
    // SharedModule, // Si vous avez un module partagé pour des éléments d'UI communs
  ],
  providers: [
    NotificationService,
    // Autres services spécifiques aux notifications
  ],
  exports: [
    NotificationsListComponent, // Si vous prévoyez d'utiliser ce composant ailleurs directement
  ]
})
export class NotificationsModule { }
