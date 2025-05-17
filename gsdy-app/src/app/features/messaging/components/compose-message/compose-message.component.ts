import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MessagingService } from '../../services/messaging.service';
import { MessageRequest } from '../../models/message.model';
import { User } from '../../../../core/models/user.model';
import { ToastService } from '../../../../core/notifications/services/toast.service';

interface Recipient extends User {}

@Component({
  selector: 'app-compose-message',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">{{ isReply ? 'Répondre' : 'Nouveau message' }}</h1>
        <a routerLink="/parent/messaging" class="text-blue-600 hover:underline flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Retour à la messagerie
        </a>
      </div>

      <form [formGroup]="messageForm" (ngSubmit)="onSubmit()" class="bg-white rounded-lg shadow p-6">
        <!-- Recipients -->
        <div class="mb-6">
          <label for="recipients" class="block text-sm font-medium text-gray-700 mb-1">Destinataires*</label>
          
          <!-- Recipients chips -->
          <div class="flex flex-wrap items-center gap-2 p-2 border rounded-md mb-2" [class.border-red-500]="showRecipientsError">
            <div *ngFor="let recipient of selectedRecipients" class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center">
              {{ recipient.name }}
              <button
                type="button" 
                (click)="removeRecipient(recipient)"
                class="ml-1 text-blue-500 hover:text-blue-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <input
              type="text"
              [formControl]="recipientInput"
              placeholder="Rechercher un destinataire..."
              class="flex-1 outline-none border-none p-1 min-w-[200px]"
              (focus)="onRecipientInputFocus()"
              (blur)="onRecipientInputBlur()" 
            />
          </div>
          
          <!-- Search results dropdown -->
          <div *ngIf="showRecipientDropdown && filteredRecipients.length > 0" class="relative z-10 mb-2">
            <ul class="absolute w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              <li
                *ngFor="let recipient of filteredRecipients"
                (click)="addRecipient(recipient)"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                <span class="font-medium">{{ recipient.name }}</span>
                <span class="ml-2 text-sm text-gray-500">({{ getRoleLabel(recipient.role) }})</span>
              </li>
            </ul>
          </div>
          
          <div *ngIf="showRecipientsError" class="text-red-600 text-sm mt-1">
            Veuillez sélectionner au moins un destinataire
          </div>
        </div>
        
        <!-- Subject -->
        <div class="mb-6">
          <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">Sujet*</label>
          <input
            type="text"
            id="subject"
            formControlName="subject"
            class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            [class.border-red-500]="submitted && messageForm.controls['subject'].errors"
          />
          <div *ngIf="submitted && messageForm.controls['subject'].errors?.['required']" class="text-red-600 text-sm mt-1">
            Le sujet est obligatoire
          </div>
        </div>
        
        <!-- Priority -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
          <div class="flex space-x-4">
            <label class="inline-flex items-center">
              <input type="radio" formControlName="priority" value="normal" class="mr-2" />
              <span>Normale</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" formControlName="priority" value="high" class="mr-2" />
              <span>Haute</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" formControlName="priority" value="urgent" class="mr-2" />
              <span>Urgente</span>
            </label>
          </div>
        </div>
        
        <!-- Message Content -->
        <div class="mb-6">
          <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Message*</label>
          <textarea
            id="content"
            formControlName="content"
            rows="8"
            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            [class.border-red-500]="submitted && messageForm.controls['content'].errors"
          ></textarea>
          <div *ngIf="submitted && messageForm.controls['content'].errors?.['required']" class="text-red-600 text-sm mt-1">
            Le contenu du message est obligatoire
          </div>
        </div>
        
        <!-- Attachments (future implementation) -->
        <div class="mb-6 border-t pt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Pièces jointes</label>
          <div class="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p class="mt-1 text-sm text-gray-600">
                La fonctionnalité d'ajout de pièces jointes sera disponible prochainement
              </p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            (click)="cancel()"
            class="px-6 py-2 border text-gray-700 rounded-md hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-gray-500">
            Annuler
          </button>
          <button
            type="submit"
            [disabled]="sending"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
            <span *ngIf="!sending">Envoyer</span>
            <span *ngIf="sending" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ComposeMessageComponent implements OnInit {
  messageForm!: FormGroup;
  recipientInput!: FormControl;
  selectedRecipients: Recipient[] = [];
  filteredRecipients: Recipient[] = [];
  showRecipientDropdown = false;
  showRecipientsError = false;
  submitted = false;
  sending = false;
  isReply = false;
  replyToMessageId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messagingService: MessagingService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.messageForm = this.fb.group({
      subject: ['', Validators.required],
      content: ['', Validators.required],
      priority: ['normal' as 'normal' | 'high' | 'urgent']
    });

    this.recipientInput = this.fb.control('');

    this.recipientInput.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string | null): Observable<User[]> => {
        if (query && query.trim() !== '') {
          return this.messagingService.searchUsers(query);
        }
        return of([]);
      })
    ).subscribe((recipients: User[]) => {
      this.filteredRecipients = recipients.filter(recipient =>
        !this.selectedRecipients.some(r => r.id === recipient.id)
      );
    });

    this.route.queryParams.subscribe(params => {
      const replyToId = params['replyTo'];
      const originalSenderId = params['senderId'];
      const originalSubject = params['subject'];

      if (replyToId) {
        this.isReply = true;
        this.replyToMessageId = replyToId;
        this.messageForm.patchValue({
          subject: originalSubject ? `Re: ${originalSubject}` : ''
        });

        if (originalSenderId) {
          this.messagingService.searchUsers(originalSenderId).subscribe((users: User[]) => {
            if (users.length > 0) {
              const senderAsRecipient = users.find(u => u.id === originalSenderId);
              if (senderAsRecipient) {
                this.addRecipient(senderAsRecipient);
              } else {
                console.warn("Could not automatically add original sender to recipients for reply.");
              }
            }
          });
        }
      }
    });
  }

  onRecipientInputFocus(): void {
    this.showRecipientDropdown = true;
    const query = this.recipientInput.value;
    if (query && query.trim() !== '' && this.filteredRecipients.length === 0) {
      this.messagingService.searchUsers(query).subscribe((recipients: User[]) => {
        this.filteredRecipients = recipients.filter(recipient => 
          !this.selectedRecipients.some(r => r.id === recipient.id)
        );
      });
    }
  }

  onRecipientInputBlur(): void {
    setTimeout(() => {
      this.showRecipientDropdown = false;
    }, 150);
  }

  addRecipient(recipient: Recipient): void {
    if (!this.selectedRecipients.some(r => r.id === recipient.id)) {
      this.selectedRecipients.push(recipient);
    }
    this.recipientInput.setValue('');
    this.showRecipientDropdown = false;
    this.showRecipientsError = false;
    this.filteredRecipients = [];
  }

  removeRecipient(recipient: Recipient): void {
    this.selectedRecipients = this.selectedRecipients.filter(r => r.id !== recipient.id);
    if (this.selectedRecipients.length === 0) {
      this.showRecipientsError = true;
    }
  }

  getRoleLabel(role: User['role']): string {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'teacher':
        return 'Enseignant';
      case 'parent':
        return 'Parent';
      case 'student':
        return 'Élève';
      default:
        return role;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.showRecipientsError = this.selectedRecipients.length === 0;

    if (this.messageForm.invalid || this.showRecipientsError) {
      Object.values(this.messageForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.sending = true;

    const messageRequest: MessageRequest = {
      subject: this.messageForm.value.subject,
      content: this.messageForm.value.content,
      recipients: this.selectedRecipients.map(r => r.id),
      priority: this.messageForm.value.priority,
      parentId: this.isReply && this.replyToMessageId ? this.replyToMessageId : undefined
    };

    this.messagingService.sendMessage(messageRequest).subscribe(
      () => {
        this.sending = false;
        this.toastService.showSuccess('Message envoyé avec succès');
        this.router.navigate(['/parent/messaging']);
      },
      (error: any) => {
        this.sending = false;
        console.error("Erreur lors de l'envoi du message:", error);
        this.toastService.showError("Erreur lors de l'envoi du message. Veuillez réessayer.");
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/parent/messaging']);
  }
}
