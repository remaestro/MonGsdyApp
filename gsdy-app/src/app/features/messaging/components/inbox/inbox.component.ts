import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MessagingService } from '../../services/messaging.service';
import { Message } from '../../models/message.model';
import { User } from '../../../../core/models/user.model';
import { ToastService } from '../../../../core/notifications/services/toast.service';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-inbox',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Messagerie</h1>
        <button 
          (click)="openComposeMessage()"
          class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center transition-colors">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nouveau message
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-4">
          <!-- Sidebar -->
          <div class="lg:col-span-1 border-r">
            <nav class="py-4">
              <a 
                (click)="changeTab('inbox')"
                [class.bg-blue-50]="activeTab === 'inbox'"
                [class.text-blue-600]="activeTab === 'inbox'"
                class="flex items-center px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span class="font-medium">Boîte de réception</span>
                <span 
                  *ngIf="unreadCount > 0"
                  class="ml-auto bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {{ unreadCount }}
                </span>
              </a>
              
              <a 
                (click)="changeTab('sent')"
                [class.bg-blue-50]="activeTab === 'sent'"
                [class.text-blue-600]="activeTab === 'sent'"
                class="flex items-center px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                <span class="font-medium">Messages envoyés</span>
              </a>
            </nav>
            
            <div class="px-6 py-4 border-t">
              <h3 class="font-semibold text-gray-600 mb-2">Filtres</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <div class="flex space-x-2">
                    <button 
                      [ngClass]="{'bg-blue-600 text-white': readFilter === 'all', 'bg-gray-200 text-gray-700': readFilter !== 'all'}"
                      (click)="filterByReadStatus('all')"
                      class="px-3 py-1 rounded text-sm font-medium transition-colors">
                      Tous
                    </button>
                    <button 
                      [ngClass]="{'bg-blue-600 text-white': readFilter === 'unread', 'bg-gray-200 text-gray-700': readFilter !== 'unread'}"
                      (click)="filterByReadStatus('unread')"
                      class="px-3 py-1 rounded text-sm font-medium transition-colors">
                      Non lus
                    </button>
                    <button 
                      [ngClass]="{'bg-blue-600 text-white': readFilter === 'read', 'bg-gray-200 text-gray-700': readFilter !== 'read'}"
                      (click)="filterByReadStatus('read')"
                      class="px-3 py-1 rounded text-sm font-medium transition-colors">
                      Lus
                    </button>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select 
                    [formControl]="priorityFilter"
                    class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">Toutes les priorités</option>
                    <option value="normal">Normale</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                  <div class="relative">
                    <input 
                      type="text" 
                      [formControl]="searchFilter"
                      placeholder="Rechercher..." 
                      class="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <svg class="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Liste des messages -->
          <div class="lg:col-span-3 max-h-[70vh] overflow-y-auto">
            <div *ngIf="loading" class="flex justify-center items-center py-20">
              <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="ml-2 text-gray-600">Chargement des messages...</span>
            </div>
            
            <div *ngIf="!loading && filteredMessages.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
              <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <p class="text-lg mb-1">Aucun message trouvé</p>
              <p class="text-sm">Votre {{ activeTab === 'inbox' ? 'boîte de réception' : 'dossier d\'envoi' }} est vide.</p>
            </div>
            
            <div *ngIf="!loading && filteredMessages.length > 0">
              <div 
                *ngFor="let message of filteredMessages" 
                (click)="openMessage(message)"
                [class.bg-blue-50]="message.id === selectedMessageId"
                [class.border-l-4]="message.id === selectedMessageId" 
                [class.border-blue-600]="message.id === selectedMessageId"
                [class.font-semibold]="!message.readAt && activeTab === 'inbox'"
                class="border-b hover:bg-gray-50 cursor-pointer transition-colors">
                <div class="px-6 py-4">
                  <div class="flex justify-between items-start mb-1">
                    <div class="flex items-center">
                      <span class="mr-2">
                        {{ activeTab === 'inbox' ? 'De:' : 'À:' }}
                      </span>
                      <span class="truncate max-w-xs">
                        {{ activeTab === 'inbox' ? message.sender.name : getRecipientsPreview(message.recipients) }}
                      </span>
                    </div>
                    <div class="text-sm text-gray-500 flex-shrink-0 ml-2">
                      {{ message.createdAt | date:'dd/MM/yyyy HH:mm' }}
                    </div>
                  </div>
                  
                  <div class="flex items-center mb-1">
                    <span
                      *ngIf="message.priority === 'urgent'" 
                      class="mr-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      Urgent
                    </span>
                    <span
                      *ngIf="message.priority === 'high'" 
                      class="mr-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Haute priorité
                    </span>
                    <h3 class="font-medium truncate">{{ message.subject }}</h3>
                  </div>
                  
                  <p class="text-gray-600 text-sm truncate">
                    {{ message.content | slice:0:150 }}{{ message.content && message.content.length > 150 ? '...' : '' }}
                  </p>
                  
                  <div *ngIf="message.attachments && message.attachments.length > 0" class="flex items-center mt-2">
                    <svg class="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                    </svg>
                    <span class="text-xs text-gray-500">
                      {{ message.attachments.length }} pièce{{ message.attachments.length > 1 ? 's' : '' }} jointe{{ message.attachments.length > 1 ? 's' : '' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class InboxComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  activeTab: 'inbox' | 'sent' = 'inbox';
  readFilter: 'all' | 'read' | 'unread' = 'all';
  priorityFilter = new FormControl('all' as Message['priority'] | 'all');
  searchFilter = new FormControl('');

  loading = false;
  unreadCount = 0;
  selectedMessageId: string | null = null;

  private destroy$ = new Subject<void>();
  private messagesSubscription?: Subscription;

  constructor(
    private messagingService: MessagingService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadMessages();
    this.loadUnreadCount();

    this.priorityFilter.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.searchFilter.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.messagesSubscription) {
        this.messagesSubscription.unsubscribe();
    }
  }

  loadMessages(): void {
    this.loading = true;
    this.selectedMessageId = null;

    if (this.messagesSubscription) {
        this.messagesSubscription.unsubscribe();
    }

    const messagesObservable = this.activeTab === 'inbox'
      ? this.messagingService.getInboxMessages(this.getCurrentFilters())
      : this.messagingService.getSentMessages(this.getCurrentFilters());

    this.messagesSubscription = messagesObservable.pipe(takeUntil(this.destroy$)).subscribe(
      (messages: Message[]) => {
        this.messages = messages;
        this.applyFilters();
        this.loading = false;
      },
      (error: any) => {
        console.error('Error loading messages:', error);
        this.toastService.showError('Erreur lors du chargement des messages.');
        this.loading = false;
      }
    );
  }

  loadUnreadCount(): void {
    this.messagingService.getUnreadCount()
    .pipe(takeUntil(this.destroy$))
    .subscribe(count => {
      this.unreadCount = count;
    });
  }

  getCurrentFilters(): any {
    const filters: any = {
        priority: this.priorityFilter.value === 'all' ? undefined : this.priorityFilter.value,
        search: this.searchFilter.value || undefined
    };
    if (this.activeTab === 'inbox') {
        filters.read = this.readFilter === 'read' ? true : (this.readFilter === 'unread' ? false : undefined);
    }
    return filters;
  }

  applyFilters(): void {
    let tempMessages = [...this.messages];

    if (this.activeTab === 'inbox') {
      if (this.readFilter === 'read') {
        tempMessages = tempMessages.filter(m => m.readAt !== null && m.readAt !== undefined);
      } else if (this.readFilter === 'unread') {
        tempMessages = tempMessages.filter(m => m.readAt === null || m.readAt === undefined);
      }
    }

    const priority = this.priorityFilter.value;
    if (priority && priority !== 'all') {
      tempMessages = tempMessages.filter(m => m.priority === priority);
    }

    const searchTerm = this.searchFilter.value?.toLowerCase() || '';
    if (searchTerm) {
      tempMessages = tempMessages.filter(m =>
        m.subject.toLowerCase().includes(searchTerm) ||
        m.sender.name.toLowerCase().includes(searchTerm) ||
        (m.recipients && m.recipients.some(r => r.name.toLowerCase().includes(searchTerm))) ||
        (m.content && m.content.toLowerCase().includes(searchTerm))
      );
    }
    this.filteredMessages = tempMessages;
  }

  changeTab(tab: 'inbox' | 'sent'): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    if (tab === 'sent') {
        this.readFilter = 'all';
    }
    this.loadMessages();
    if (tab === 'inbox') {
        this.loadUnreadCount();
    }
  }

  filterByReadStatus(status: 'all' | 'read' | 'unread'): void {
    this.readFilter = status;
    this.loadMessages();
  }

  openMessage(message: Message): void {
    this.selectedMessageId = message.id;
    this.router.navigate(['/parent/messaging', message.id]);
    if (this.activeTab === 'inbox' && !message.readAt) {
      this.messagingService.markAsRead(message.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
            const msgInList = this.messages.find(m => m.id === message.id);
            if (msgInList) msgInList.readAt = new Date();
            this.applyFilters();
            this.loadUnreadCount();
        });
    }
  }

  openComposeMessage(): void {
    this.router.navigate(['/parent/messaging/compose']);
  }

  getRecipientsPreview(recipients: User[]): string {
    if (!recipients || recipients.length === 0) return 'N/A';
    const maxToShow = 2;
    let preview = recipients.slice(0, maxToShow).map(r => r.name).join(', ');
    if (recipients.length > maxToShow) {
      preview += `, +${recipients.length - maxToShow}`;
    }
    return preview;
  }
}
