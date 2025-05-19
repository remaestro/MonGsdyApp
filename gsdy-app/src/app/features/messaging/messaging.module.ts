import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MessagingRoutingModule } from './messaging-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { InboxComponent } from './components/inbox/inbox.component';
import { MessageDetailComponent } from './components/message-detail/message-detail.component';
import { ComposeMessageComponent } from './components/compose-message/compose-message.component';

@NgModule({
  declarations: [
    InboxComponent,
    MessageDetailComponent,
    ComposeMessageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MessagingRoutingModule,
    SharedModule
  ]
})
export class MessagingModule { }
