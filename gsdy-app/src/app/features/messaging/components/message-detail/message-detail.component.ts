import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessagingService } from '../../services/messaging.service'; // Correction du chemin
import { Message, Attachment } from '../../models/message.model'; // Correction du chemin
import { ToastService } from '../../../../core/notifications/services/toast.service'; // Correction du chemin
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-message-detail',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center">
          <button 
            (click)="goBack()"
            class="text-gray-600 hover:text-gray-800 mr-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <h1 class="text-3xl font-bold">Message</h1>
        </div>
        
        <div class="flex space-x-2">
          <button 
            *ngIf="message && !message.readAt"
            (click)="markAsRead()"
            class="bg-gray-200 text-gray-700 hover:bg-gray-300 py-2 px-4 rounded flex items-center transition-colors">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Marquer comme lu
          </button>
          <button 
            *ngIf="message && message.readAt"
            (click)="markAsUnread()"
            class="bg-gray-200 text-gray-700 hover:bg-gray-300 py-2 px-4 rounded flex items-center transition-colors">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Marquer comme non lu
          </button>
          <button 
            *ngIf="message"
            (click)="replyToMessage()"
            class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center transition-colors">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
            </svg>
            Répondre
          </button>
          <button 
            *ngIf="message"
            (click)="deleteMessage()"
            class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center transition-colors">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Supprimer
          </button>
        </div>
      </div>
      
      <!-- Loading state -->
      <div *ngIf="loading" class="flex justify-center items-center py-20">
        <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-2 text-gray-600">Chargement du message...</span>
      </div>
      
      <!-- Message content -->
      <div *ngIf="!loading && message" class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Message header -->
        <div class="px-6 py-4 border-b">
          <div class="flex justify-between mb-2">
            <div>
              <h2 class="text-xl font-semibold">{{ message.subject }}</h2>
              <div class="text-gray-500 text-sm">
                {{ message.createdAt | date:'dd/MM/yyyy HH:mm' }}
              </div>
            </div>
            <div>
              <span
                *ngIf="message.priority === 'urgent'" 
                class="bg-red-100 text-red-800 text-sm px-3 py-1 rounded">
                Urgent
              </span>
              <span
                *ngIf="message.priority === 'high'" 
                class="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded">
                Haute priorité
              </span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-600">De:</span>
              <span class="ml-2 font-medium">{{ message.sender.name }}</span>
              <span class="ml-1 text-gray-500">({{ getSenderRoleLabel(message.sender.role) }})</span>
            </div>
            
            <div>
              <span class="text-gray-600">À:</span>
              <span class="ml-2">{{ getRecipientsList() }}</span>
            </div>
          </div>
        </div>
        
        <!-- Message body -->
        <div class="px-6 py-4 min-h-[200px]">
          <div class="prose max-w-none">
            {{ message.content }}
          </div>
        </div>
        
        <!-- Attachments -->
        <div *ngIf="message.attachments && message.attachments.length > 0" class="px-6 py-4 border-t">
          <h3 class="font-semibold mb-3">Pièces jointes</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              *ngFor="let attachment of message.attachments"
              class="border rounded-lg p-3 flex items-center">
              <div class="bg-gray-100 rounded-lg p-2 mr-3">
                <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="flex-grow">
                <div class="font-medium truncate">{{ attachment.fileName }}</div>
                <div class="text-xs text-gray-500">{{ formatFileSize(attachment.fileSize) }}</div>
              </div>
              <button 
                (click)="downloadAttachment(attachment)"
                class="ml-2 p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Error state -->
      <div *ngIf="!loading && !message && error" class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 class="text-2xl font-bold mb-2">Erreur</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button (click)="goBack()" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded">
          Retour
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MessageDetailComponent implements OnInit {
  messageId!: string; // Initialisation avec ! pour indiquer qu'elle sera assignée dans ngOnInit
  message: Message | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private messagingService: MessagingService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.messageId = id;
        this.loadMessage();
      } else {
        this.error = "ID de message non fourni.";
        this.loading = false;
      }
    });
  }

  loadMessage(): void {
    this.loading = true;
    this.error = null; // Réinitialiser l'erreur
    
    if (!this.messageId) {
      this.error = "ID de message invalide";
      this.loading = false;
      return;
    }
    
    this.messagingService.getMessage(this.messageId).subscribe(
      (message: Message) => { // Typage explicite
        this.message = message;
        this.loading = false;
      },
      (error: any) => { // Typage explicite
        this.error = "Impossible de charger le message. Il est possible qu'il ait été supprimé ou que vous n'ayez pas les autorisations nécessaires.";
        this.loading = false;
      }
    );
  }

  markAsRead(): void {
    if (this.message) {
      this.messagingService.markAsRead(this.message.id).subscribe(
        (updatedMessage: Message) => { // Typage explicite
          this.message = updatedMessage;
          this.toastService.showSuccess("Message marqué comme lu");
        },
        (error: any) => { // Typage explicite
          this.toastService.showError("Erreur lors de la mise à jour du statut du message");
        }
      );
    }
  }

  markAsUnread(): void {
    if (this.message) {
      this.messagingService.markAsUnread(this.message.id).subscribe(
        (updatedMessage: Message) => { // Typage explicite
          this.message = updatedMessage;
          this.toastService.showSuccess("Message marqué comme non lu");
        },
        (error: any) => { // Typage explicite
          this.toastService.showError("Erreur lors de la mise à jour du statut du message");
        }
      );
    }
  }

  replyToMessage(): void {
    if (this.message) {
      this.router.navigate(['/parent/messaging/compose'], { 
        queryParams: { 
          reply: this.message.id,
          to: this.message.sender.id,
          subject: `RE: ${this.message.subject}`
        } 
      });
    }
  }

  deleteMessage(): void {
    if (this.message && confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) { // Vérifier si this.message existe
      this.messagingService.deleteMessage(this.messageId).subscribe(
        () => {
          this.toastService.showSuccess("Message supprimé avec succès");
          this.router.navigate(['/parent/messaging']);
        },
        (error: any) => { // Typage explicite
          this.toastService.showError("Erreur lors de la suppression du message");
        }
      );
    }
  }

  downloadAttachment(attachment: Attachment): void {
    if (!this.message) return; // S'assurer que le message est chargé
    this.messagingService.downloadAttachment(this.message.id, attachment.id).subscribe( // Utiliser this.message.id
      (blob: Blob) => { // Typage explicite
        // Créer un objet URL pour le blob
        const url = window.URL.createObjectURL(blob);
        
        // Créer un élément a temporaire
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.fileName;
        
        // Ajouter à la page, cliquer, puis supprimer
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      (error: any) => { // Typage explicite
        this.toastService.showError("Erreur lors du téléchargement de la pièce jointe");
      }
    );
  }

  goBack(): void {
    this.location.back();
  }

  getSenderRoleLabel(role: string): string {
    switch (role) {
      case 'parent':
        return 'Parent';
      case 'admin':
        return 'Administration';
      case 'teacher':
        return 'Enseignant';
      default:
        return role;
    }
  }

  getRecipientsList(): string {
    if (!this.message || !this.message.recipients) return '';
    return this.message.recipients.join(', ');
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
