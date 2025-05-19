import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MessagingService } from '../../services/messaging.service';
import { Message } from '../../models/message.model';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { BehaviorSubject, Observable, Subject, combineLatest, of } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged, switchMap, takeUntil, tap, catchError } from 'rxjs/operators';
import { ToastService } from '../../../../core/notifications/services/toast.service';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InboxComponent implements OnInit, OnDestroy {
  activeTab: 'inbox' | 'sent' = 'inbox';
  
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  
  filteredMessages$: Observable<Message[]>;
  selectedMessage$: Observable<Message | undefined>;

  isLoading = false;
  error: string | null = null;
  
  unreadCount = 0;
  currentUser: User | null;

  searchTerm = '';
  filterPriority: Message['priority'] | 'all' = 'all';
  private searchTermSubject = new Subject<string>();
  private priorityFilterSubject = new BehaviorSubject<Message['priority'] | 'all'>(this.filterPriority);

  private destroy$ = new Subject<void>();

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    this.currentUser = this.authService.getCurrentUserSync();

    const searchTermDebounced$ = this.searchTermSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith('')
    );

    this.filteredMessages$ = combineLatest([
      this.messages$,
      this.priorityFilterSubject.asObservable().pipe(distinctUntilChanged()),
      searchTermDebounced$
    ]).pipe(
      map(([messages, priority, term]) => 
        this.filterMessages(messages, priority, term)
      ),
      takeUntil(this.destroy$)
    );

    this.selectedMessage$ = this.messages$.pipe(
      map(messages => messages.find(m => m.id === this.router.url.split('/').pop()))
    );
  }

  ngOnInit(): void {
    this.loadMessages();
    if (this.currentUser && this.activeTab === 'inbox') {
      this.loadUnreadCount();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMessages(): void {
    if (!this.currentUser) {
      this.error = "Utilisateur non authentifié.";
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }
    this.isLoading = true;
    this.error = null;

    let messagesObservable$: Observable<Message[]>;
    if (this.activeTab === 'inbox') {
      messagesObservable$ = this.messagingService.getInboxMessages(); 
    } else {
      messagesObservable$ = this.messagingService.getSentMessages(this.currentUser.id);
    }

    messagesObservable$.pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Error loading messages:', err);
        this.error = "Erreur lors du chargement des messages.";
        this.toastService.showError(this.error);
        this.isLoading = false;
        this.messagesSubject.next([]);
        this.cdr.markForCheck();
        return of([]);
      })
      )
      .subscribe(
      (messages: Message[]) => {
        this.messagesSubject.next(messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    );
  }

  loadUnreadCount(): void {
    if (this.currentUser) {
      this.messagingService.getUnreadCount(this.currentUser.id) 
        .pipe(takeUntil(this.destroy$))
        .subscribe((count: number) => { // Typage explicite de count
          this.unreadCount = count;
          this.cdr.markForCheck();
        });
    }
  }

  applyFiltersDebounced(): void {
    this.searchTermSubject.next(this.searchTerm);
  }

  applyFilters(): void {
    this.priorityFilterSubject.next(this.filterPriority);
  }

  private filterMessages(messages: Message[], priority: Message['priority'] | 'all', term: string): Message[] {
    let filtered = [...messages];
    if (priority !== 'all') {
      filtered = filtered.filter(m => m.priority === priority);
    }
    if (term) {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter(m => 
        m.subject.toLowerCase().includes(lowerTerm) ||
        m.content.toLowerCase().includes(lowerTerm) ||
        (m.sender && m.sender.name.toLowerCase().includes(lowerTerm)) ||
        (m.recipients && m.recipients.some(r => r.name.toLowerCase().includes(lowerTerm)))
      );
    }
    return filtered;
  }

  selectTab(tab: 'inbox' | 'sent'): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.searchTerm = '';
    this.filterPriority = 'all';
    this.searchTermSubject.next(''); 
    this.priorityFilterSubject.next('all');
    this.loadMessages();
    if (this.currentUser && this.activeTab === 'inbox') {
      this.loadUnreadCount();
    }
  }

  selectMessage(messageId: string): void {
    this.router.navigate(['/messaging', messageId]);
    const message = this.messagesSubject.value.find(m => m.id === messageId);
    if (this.currentUser && message && this.activeTab === 'inbox' && !message.isRead) {
      this.messagingService.markAsRead(messageId) 
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success) {
            const updatedMessages = this.messagesSubject.value.map(m => 
              m.id === messageId ? { ...m, isRead: true, readAt: new Date() } : m
            );
            this.messagesSubject.next(updatedMessages);
            this.loadUnreadCount(); 
            this.cdr.markForCheck();
          }
        });
    }
  }

  getSenderDisplayName(message: Message): string {
    if (message.sender) {
      return message.sender.name || 'Utilisateur inconnu';
    }
    return 'Système';
  }

  getRecipientDisplayName(message: Message): string {
    if (message.recipients && message.recipients.length > 0) {
      const names = message.recipients.map(r => r.name).filter(name => !!name);
      if (names.length === 0) return 'Destinataires inconnus';
      if (names.length > 2) {
        return `${names.slice(0, 2).join(', ')} et ${names.length - 2} autre${names.length - 2 > 1 ? 's' : ''}`;
      }
      return names.join(', ');
    }
    return 'Destinataire inconnu';
  }

  isSentByCurrentUser(message: Message): boolean {
    return !!this.currentUser && !!message.sender && message.sender.id === this.currentUser.id;
  }
}
