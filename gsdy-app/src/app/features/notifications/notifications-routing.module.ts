import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationsListComponent } from './components/notifications-list/notifications-list.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationsListComponent
  },
  // Vous pourrez ajouter d'autres routes spécifiques aux notifications ici
  // par exemple, pour voir le détail d'une notification si nécessaire:
  // { path: ':id', component: NotificationDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule { }
