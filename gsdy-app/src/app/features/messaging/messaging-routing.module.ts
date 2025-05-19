import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InboxComponent } from './components/inbox/inbox.component';
import { MessageDetailComponent } from './components/message-detail/message-detail.component';
import { ComposeMessageComponent } from './components/compose-message/compose-message.component';
// Assurez-vous que le guard d'authentification est correctement importé si nécessaire
// import { AuthGuard } from '../../core/auth/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    // canActivate: [AuthGuard], // Décommentez si l'accès à la messagerie nécessite une authentification
    children: [
      {
        path: 'inbox',
        component: InboxComponent,
        data: { title: 'Boîte de réception' }
      },
      {
        path: 'message/:id',
        component: MessageDetailComponent,
        data: { title: 'Détail du Message' }
      },
      {
        path: 'compose',
        component: ComposeMessageComponent,
        data: { title: 'Nouveau Message' }
      },
      {
        path: '', // Route par défaut pour /messaging
        redirectTo: 'inbox',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagingRoutingModule { }
