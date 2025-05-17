import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Composants
import { InboxComponent } from './components/inbox/inbox.component';
import { MessageDetailComponent } from './components/message-detail/message-detail.component';
import { ComposeMessageComponent } from './components/compose-message/compose-message.component';

// Services
// import { MessagingService } from './services/messaging.service'; // Le service est déjà providedIn: 'root'

const routes: Routes = [
  { path: '', component: InboxComponent },
  { path: 'compose', component: ComposeMessageComponent },
  { path: ':id', component: MessageDetailComponent }
];

@NgModule({
  declarations: [
    InboxComponent,
    MessageDetailComponent,
    ComposeMessageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule
  ]
})
export class MessagingModule { }
