import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, tap, finalize, map } from 'rxjs/operators';
import { MessagingService } from '../../services/messaging.service';
import { Message, Attachment, MessagePriority, MessageRequest } from '../../models/message.model';
import { User } from '../../../../core/models/user.model';
import { ToastService } from '../../../../core/notifications/services/toast.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-compose-message',
  templateUrl: './compose-message.component.html',
  styleUrls: ['./compose-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComposeMessageComponent implements OnInit, OnDestroy {
  composeForm!: FormGroup;
  selectedRecipients: User[] = [];
  
  private recipientSearchTerm = new BehaviorSubject<string>('');
  filteredRecipients$: Observable<User[]> = of([]);

  submitted = false;
  isSending = false;
  isLoading = false;
  isReply = false;
  replyToMessageId: string | null = null;
  originalMessage: Message | null = null;

  attachments: File[] = [];
  maxFileSize = 5 * 1024 * 1024;

  error: string | null = null;
  successMessage: string | null = null;

  private destroy$ = new Subject<void>();
  currentUser: User | null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messagingService: MessagingService,
    private toastService: ToastService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.getCurrentUserSync();
  }

  ngOnInit(): void {
    this.composeForm = this.fb.group({
      recipientSearch: [''],
      subject: ['', Validators.required],
      content: ['', Validators.required],
      priority: ['normal' as MessagePriority, Validators.required]
    });

    this.filteredRecipients$ = this.recipientSearchTerm.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (term && term.trim().length > 1) {
          return this.messagingService.getPotentialRecipients().pipe(
            map((users: User[]) => users.filter(user => 
              user.name.toLowerCase().includes(term.toLowerCase()) &&
              !this.selectedRecipients.some(r => r.id === user.id)
            )),
            catchError(() => of([]))
          );
        }
        return of([]);
      })
    );

    this.composeForm.get('recipientSearch')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.recipientSearchTerm.next(value || '');
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.replyToMessageId = params['replyTo'] || null;
      const toUserId = params['to'];
      const subject = params['subject'];

      if (this.replyToMessageId) {
        this.isReply = true;
        this.isLoading = true;
        this.messagingService.getMessageById(this.replyToMessageId)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => {
              this.isLoading = false;
              this.cdr.markForCheck();
            })
          )
          .subscribe(message => {
            if (message) {
              this.originalMessage = message;
              this.composeForm.patchValue({
                subject: subject || `RE: ${message.subject}`,
              });
              if (message.sender && !this.selectedRecipients.some(r => r.id === message.sender.id)) {
                const senderAsRecipient: User = {
                    id: message.sender.id, 
                    name: message.sender.name,
                    role: message.sender.role || 'parent',
                };
                this.addRecipient(senderAsRecipient);
              }
            } else {
              this.toastService.showError("Message original non trouvé pour la réponse.");
              this.router.navigate(['/messaging/compose']);
            }
          });
      } else if (toUserId) {
        this.messagingService.getUserById(toUserId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(user => {
            if (user) {
              this.addRecipient(user);
            }
          });
        if (subject) {
          this.composeForm.patchValue({ subject });
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addRecipient(recipient: User): void {
    if (!this.selectedRecipients.some(r => r.id === recipient.id)) {
      this.selectedRecipients.push(recipient);
    }
    this.composeForm.get('recipientSearch')?.setValue('', { emitEvent: false });
    this.recipientSearchTerm.next('');
    this.validateRecipients();
    this.cdr.markForCheck();
  }

  removeRecipient(recipient: User): void {
    this.selectedRecipients = this.selectedRecipients.filter(r => r.id !== recipient.id);
    this.validateRecipients();
    this.cdr.markForCheck();
  }

  private validateRecipients(): void {
    if (this.selectedRecipients.length === 0) {
      this.composeForm.get('recipientSearch')?.setErrors({ noRecipients: true });
    } else {
      this.composeForm.get('recipientSearch')?.setErrors(null);
    }
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.size > this.maxFileSize) {
          this.toastService.showError(`Le fichier ${file.name} est trop volumineux (max 5MB).`);
          continue;
        }
        if (this.attachments.length < 5) {
            this.attachments.push(file);
        } else {
            this.toastService.showWarning("Vous ne pouvez joindre que 5 fichiers maximum.");
            break;
        }
      }
    }
    element.value = '';
    this.cdr.markForCheck();
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
    this.cdr.markForCheck();
  }

  formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getRoleLabel(role: User['role']): string {
    return role || 'N/A';
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;
    this.successMessage = null;
    this.validateRecipients();

    if (this.composeForm.invalid || this.selectedRecipients.length === 0) {
      this.toastService.showError("Veuillez corriger les erreurs dans le formulaire.");
      Object.values(this.composeForm.controls).forEach(control => {
        control.markAsTouched();
      });
      if (this.selectedRecipients.length === 0) {
        this.error = "Veuillez sélectionner au moins un destinataire.";
      }
      this.cdr.markForCheck();
      return;
    }

    this.isSending = true;

    const formValue = this.composeForm.value;
    // Construct the data object according to MessagingService.sendMessage requirements
    const serviceMessageData = { 
      subject: formValue.subject,
      content: formValue.content,
      recipients: this.selectedRecipients.map(r => ({ id: r.id, name: r.name, role: r.role || 'parent' })),
      priority: formValue.priority as MessagePriority,
      replyToId: this.replyToMessageId, 
    };

    this.messagingService.sendMessage(serviceMessageData, this.attachments)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSending = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (sentMessage) => {
          this.successMessage = "Message envoyé avec succès !";
          this.toastService.showSuccess(this.successMessage);
          this.composeForm.reset({
            priority: 'normal'
          });
          this.selectedRecipients = [];
          this.attachments = [];
          this.submitted = false;
          if (this.currentUser?.id) {
            this.messagingService.notifyMessageStatusChange('new_sent_message', this.currentUser.id);
          }
          setTimeout(() => this.router.navigate(['/messaging/inbox']), 1500);
        },
        error: (err) => {
          console.error("Erreur lors de l'envoi du message:", err);
          this.error = "Échec de l'envoi du message. Veuillez réessayer.";
          this.toastService.showError(this.error);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/messaging/inbox']);
  }
}
