import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessagingService } from '../../services/messaging.service';
import { Message, Attachment } from '../../models/message.model';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { ToastService } from '../../../../core/notifications/services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDetailComponent implements OnInit, OnDestroy {
  message: Message | null = null;
  isLoading = true;
  error: string | null = null;
  currentUser: User | null;

  private messageId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private messagingService: MessagingService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.getCurrentUserSync();
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.messageId = id;
        this.loadMessage();
      } else {
        this.error = "ID de message non fourni.";
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMessage(): void {
    if (!this.messageId) {
      this.error = "ID de message non fourni.";
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.messagingService.getMessageById(this.messageId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(
        (msg) => {
          if (msg) {
            this.message = msg;
            if (this.currentUser && !msg.isRead && msg.recipients.some(r => r.id === this.currentUser?.id)) {
              this.markMessageAsRead(msg.id, false);
            } else {
              this.cdr.markForCheck();
            }
          } else {
            this.error = "Message non trouvé.";
          }
        },
        (err) => {
          console.error('Error loading message:', err);
          this.error = "Erreur lors du chargement du message.";
          this.toastService.showError(this.error);
        }
      );
  }

  private markMessageAsRead(messageId: string, showToast = true): void {
    this.messagingService.markAsRead(messageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(success => {
        if (success && this.message) {
          this.message = { ...this.message, isRead: true, readAt: new Date() };
          if (showToast) this.toastService.showSuccess("Message marqué comme lu.");
          this.cdr.markForCheck();
          this.messagingService.notifyMessageStatusChange(messageId, 'read'); 
        } else if (showToast) {
          this.toastService.showError("Erreur lors du marquage comme lu.");
        }
      });
  }

  toggleReadStatus(): void {
    if (!this.message || !this.currentUser) return;

    if (this.message.isRead) {
      this.messagingService.markAsUnread(this.message.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success && this.message) {
            this.message = { ...this.message, isRead: false, readAt: undefined };
            this.toastService.showSuccess("Message marqué comme non lu.");
            this.cdr.markForCheck();
            this.messagingService.notifyMessageStatusChange(this.message.id, 'unread');
          } else {
            this.toastService.showError("Erreur lors du marquage comme non lu.");
          }
        });
    } else {
      this.markMessageAsRead(this.message.id);
    }
  }

  canMarkAsRead(): boolean {
    return !!this.message && !this.message.isRead && this.isRecipient();
  }

  canMarkAsUnread(): boolean {
    return !!this.message && !!this.message.isRead && this.isRecipient();
  }

  isRecipient(): boolean {
    return !!this.currentUser && !!this.message && this.message.recipients.some(r => r.id === this.currentUser?.id);
  }

  canReply(): boolean {
    return !!this.message && !!this.currentUser && this.message.sender?.id !== this.currentUser.id;
  }

  replyToMessage(): void {
    if (!this.message) return;
    this.router.navigate(['/messaging/compose'], {
      queryParams: {
        replyTo: this.message.id,
        to: this.message.sender?.id,
        subject: `RE: ${this.message.subject}`,
      }
    });
  }

  forwardMessage(): void {
    if (!this.message) return;

    let contentToForward = `\n\n---------- Message transféré ----------\n`;
    contentToForward += `De : ${this.getSenderDisplayName()}\n`;
    contentToForward += `Date : ${new Date(this.message.createdAt).toLocaleString()}\n`;
    contentToForward += `Sujet : ${this.message.subject}\n`;
    contentToForward += `À : ${this.getRecipientDisplayNames()}\n\n`;
    contentToForward += `${this.message.content}`;

    this.router.navigate(['/messaging/compose'], {
      queryParams: {
        forwardOf: this.message.id,
        subject: `Fwd: ${this.message.subject}`,
        content: contentToForward,
      }
    });
  }

  deleteMessage(): void {
    if (!this.messageId) return;
    if (confirm("Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.")) {
      this.isLoading = true;
      const currentMessageId = this.messageId;
      this.messagingService.deleteMessage(this.messageId)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe(
          (success) => {
            if (success) {
              this.toastService.showSuccess("Message supprimé avec succès.");
              this.messagingService.notifyMessageStatusChange(currentMessageId, 'deleted'); 
              this.router.navigate(['/messaging/inbox']);
            } else {
              this.toastService.showError("Erreur lors de la suppression du message.");
            }
          },
          (err) => {
            console.error('Error deleting message:', err);
            this.toastService.showError("Une erreur technique est survenue lors de la suppression.");
          }
        );
    }
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/messaging/inbox']);
    }
  }

  getAttachmentIcon(attachment: Attachment): string {
    if (!attachment || !attachment.fileType) return 'fas fa-file';
    if (attachment.fileType.startsWith('image/')) return 'fas fa-file-image';
    if (attachment.fileType === 'application/pdf') return 'fas fa-file-pdf';
    if (attachment.fileType.includes('word')) return 'fas fa-file-word';
    if (attachment.fileType.includes('excel') || attachment.fileType.includes('spreadsheet')) return 'fas fa-file-excel';
    if (attachment.fileType.includes('presentation') || attachment.fileType.includes('powerpoint')) return 'fas fa-file-powerpoint';
    if (attachment.fileType === 'application/zip' || attachment.fileType === 'application/x-rar-compressed') return 'fas fa-file-archive';
    return 'fas fa-file';
  }

  formatFileSize(bytes?: number): string {
    if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isSentByCurrentUser(): boolean {
    if (!this.message || !this.message.sender || !this.currentUser) {
      return false;
    }
    return this.message.sender.id === this.currentUser.id;
  }

  getSenderDisplayName(): string {
    if (!this.message) return 'Système';
    if (!this.message.sender) return 'Système';
    return this.message.sender.name || 'Utilisateur inconnu';
  }

  getRecipientDisplayNames(): string {
    if (!this.message || !this.message.recipients || this.message.recipients.length === 0) {
      return 'Aucun destinataire';
    }
    return this.message.recipients
      .map(r => r.name || 'Destinataire inconnu')
      .join(', ');
  }

  downloadAttachment(attachment: Attachment): void {
    if (!attachment.fileUrl) {
      this.toastService.showError("Lien de téléchargement manquant pour la pièce jointe.");
      return;
    }
    const link = document.createElement('a');
    link.href = attachment.fileUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
