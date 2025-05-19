import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../../../messaging/models/message.model'; // Chemin corrigé
import { MessagingService } from '../../../messaging/services/messaging.service'; // Chemin corrigé
import { AuthService } from '../../../../core/auth/services/auth.service'; // Chemin d'importation corrigé

@Component({
  selector: 'app-latest-messages',
  templateUrl: './latest-messages.component.html',
  styleUrls: ['./latest-messages.component.css']
})
export class LatestMessagesComponent implements OnInit {
  latestMessages$: Observable<Message[]> | undefined;

  constructor(private messagingService: MessagingService, private authService: AuthService) { }

  ngOnInit(): void {
    this.latestMessages$ = this.messagingService.getInboxMessages();
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }
}
