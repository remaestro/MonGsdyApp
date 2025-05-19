import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError, BehaviorSubject } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule

import { InboxComponent } from './inbox.component';
import { MessagingService } from '../../services/messaging.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastService } from '../../../../core/notifications/services/toast.service';
import { User } from '../../../../core/models/user.model';
import { Message, Attachment, MessagePriority } from '../../models/message.model'; // Importer MessagePriority

// Mocks
class MockMessagingService {
  getInboxMessages = jasmine.createSpy('getInboxMessages').and.returnValue(of([]));
  getSentMessages = jasmine.createSpy('getSentMessages').and.returnValue(of([]));
  getUnreadCount = jasmine.createSpy('getUnreadCount').and.returnValue(of(0));
  markAsRead = jasmine.createSpy('markAsRead').and.returnValue(of(true));
  messageStatusChanged$ = new Subject<{ messageId: string; newStatus: string }>().asObservable(); // Mock if component subscribes
}

class MockAuthService {
  currentUser: User | null = { id: 'user123', name: 'Test User', role: 'parent', email: 'test@example.com' };
  getCurrentUserSync = jasmine.createSpy('getCurrentUserSync').and.callFake(() => this.currentUser);
}

class MockToastService {
  showSuccess = jasmine.createSpy('showSuccess');
  showError = jasmine.createSpy('showError');
}

class MockChangeDetectorRef {
  detectChanges = jasmine.createSpy('detectChanges');
  markForCheck = jasmine.createSpy('markForCheck');
}

const mockMessages: Message[] = [
  {
    id: 'msg1',
    subject: 'Hello World',
    content: 'This is a test message.',
    sender: { id: 'sender1', name: 'Sender One', role: 'teacher' },
    recipients: [{ id: 'user123', name: 'Test User', role: 'parent' }],
    createdAt: new Date(2024, 5, 10, 10, 0, 0),
    isRead: false,
    priority: 'normal' as MessagePriority // Cast en MessagePriority
  },
  {
    id: 'msg2',
    subject: 'Important Update',
    content: 'Please read this important update.',
    sender: { id: 'sender2', name: 'Admin User', role: 'admin' }, // Corrigé: Sender Two -> Admin User pour correspondre à un rôle admin
    recipients: [{ id: 'user123', name: 'Test User', role: 'parent' }],
    createdAt: new Date(2024, 5, 9, 14, 30, 0),
    isRead: true,
    priority: 'high' as MessagePriority // Cast en MessagePriority
  },
  {
    id: 'msg3',
    subject: 'Sent Item Test',
    content: 'This is a sent message by current user.',
    sender: { id: 'user123', name: 'Test User', role: 'parent' },
    recipients: [{ id: 'recipient1', name: 'Recipient Alpha', role: 'teacher' }],
    createdAt: new Date(2024, 5, 8, 12, 0, 0),
    isRead: true, // N/A for sent items usually, but for consistency
    priority: 'normal' as MessagePriority // Cast en MessagePriority
  }
];

describe('InboxComponent', () => {
  let component: InboxComponent;
  let fixture: ComponentFixture<InboxComponent>;
  let mockMessagingService: MockMessagingService;
  let mockAuthService: MockAuthService;
  let mockToastService: MockToastService;
  let router: Router;
  let cdr: ChangeDetectorRef;

  beforeEach(waitForAsync(() => { // Changé en waitForAsync
    TestBed.configureTestingModule({
      imports: [
        InboxComponent, 
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: MessagingService, useClass: MockMessagingService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: ToastService, useClass: MockToastService },
      ]
    }).compileComponents(); // Rétablir compileComponents
  }));

  beforeEach(() => { // Nouveau beforeEach pour l'instanciation
    fixture = TestBed.createComponent(InboxComponent);
    component = fixture.componentInstance;
    mockMessagingService = TestBed.inject(MessagingService) as unknown as MockMessagingService;
    mockAuthService = TestBed.inject(AuthService) as unknown as MockAuthService;
    mockToastService = TestBed.inject(ToastService) as unknown as MockToastService;
    router = TestBed.inject(Router);
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load messages on init if user is authenticated', fakeAsync(() => {
      const testMessages = [...mockMessages];
      mockAuthService.currentUser = { id: 'user123', name: 'Test User', role: 'parent', email: 'test@example.com' };
      component.currentUser = mockAuthService.currentUser;
      mockMessagingService.getInboxMessages.and.returnValue(of(testMessages));
      
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(mockMessagingService.getInboxMessages).toHaveBeenCalled();
      component.filteredMessages$.subscribe(messages => {
        expect(messages.length).toBe(testMessages.length);
      });
      tick();
      expect(component.isLoading).toBe(false);
    }));

    it('should load unread count on init if user is authenticated and tab is inbox', fakeAsync(() => {
      mockAuthService.currentUser = { id: 'user123', name: 'Test User', role: 'parent', email: 'test@example.com' };
      component.currentUser = mockAuthService.currentUser;
      component.activeTab = 'inbox';
      mockMessagingService.getUnreadCount.and.returnValue(of(5));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      
      expect(mockMessagingService.getUnreadCount).toHaveBeenCalledWith('user123');
      expect(component.unreadCount).toBe(5);
    }));

    it('should not load messages if user is not authenticated', fakeAsync(() => {
      mockAuthService.currentUser = null;
      component.currentUser = null;
      mockMessagingService.getInboxMessages.calls.reset();
      const markForCheckSpy = spyOn(cdr, 'markForCheck').and.callThrough();

      fixture.detectChanges();
      tick(); 
      fixture.detectChanges();

      expect(mockMessagingService.getInboxMessages).not.toHaveBeenCalled();
      expect(component.error).toBe("Utilisateur non authentifié.");
      expect(component.isLoading).toBe(false);
      expect(markForCheckSpy).toHaveBeenCalled(); 
    }));
  });

  describe('Tab Switching', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should switch to sent tab and load sent messages', fakeAsync(() => {
      component.selectTab('sent');
      fixture.detectChanges();
      tick();
      expect(component.activeTab).toBe('sent');
      expect(mockMessagingService.getSentMessages).toHaveBeenCalledWith('user123');
      component.messages$.subscribe(messages => {
        expect(messages.length).toBe(1);
        expect(messages[0].id).toBe('msg3');
      });
      expect(component.isLoading).toBeFalse();
      expect(mockMessagingService.getUnreadCount.calls.count()).toBe(1); 
    }));

    it('should switch back to inbox tab and load inbox messages and unread count', fakeAsync(() => {
      component.selectTab('sent');
      fixture.detectChanges();
      tick();
      mockMessagingService.getInboxMessages.calls.reset();
      mockMessagingService.getUnreadCount.calls.reset();

      component.selectTab('inbox');
      fixture.detectChanges();
      tick();
      expect(component.activeTab).toBe('inbox');
      expect(mockMessagingService.getInboxMessages).toHaveBeenCalled();
      expect(mockMessagingService.getUnreadCount).toHaveBeenCalledWith('user123');
      component.messages$.subscribe(messages => {
        expect(messages.length).toBe(2);
      });
      expect(component.isLoading).toBeFalse();
    }));
    
    it('should reset filters when switching tabs', fakeAsync(() => {
      component.searchTerm = 'test';
      component.filterPriority = 'high' as MessagePriority;
      component.selectTab('sent');
      tick();
      expect(component.searchTerm).toBe('');
      expect(component.filterPriority).toBe('all');
    }));
  });

  describe('Message Selection', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should navigate to message detail on selectMessage', () => {
      component.selectMessage(mockMessages[0].id);
      expect(router.navigate).toHaveBeenCalledWith(['/messaging', 'msg1']);
    });

    it('should mark message as read if unread and in inbox on selectMessage', fakeAsync(() => {
      const unreadMessage = mockMessages.find(m => m.id === 'msg1')!;
      expect(unreadMessage.isRead).toBeFalse();
      
      mockMessagingService.markAsRead.and.returnValue(of(true));
      component.selectMessage(unreadMessage.id);
      tick();
      
      expect(mockMessagingService.markAsRead).toHaveBeenCalledWith('msg1');
      component.messages$.subscribe(msgs => {
        const selected = msgs.find(m => m.id === 'msg1');
        expect(selected?.isRead).toBeTrue();
      });
      expect(cdr.markForCheck).toHaveBeenCalled();
    }));

    it('should not mark message as read if already read', fakeAsync(() => {
      const readMessage = mockMessages.find(m => m.id === 'msg2')!;
      component.selectMessage(readMessage.id);
      tick();
      expect(mockMessagingService.markAsRead).not.toHaveBeenCalledWith('msg2');
    }));

    it('should not mark message as read if in sent tab', fakeAsync(() => {
      component.selectTab('sent');
      fixture.detectChanges();
      tick();
      const sentMessage = mockMessages.find(m => m.id === 'msg3')!;
      component.selectMessage(sentMessage.id);
      tick();
      expect(mockMessagingService.markAsRead).not.toHaveBeenCalled();
    }));
  });

  describe('Filtering and Searching', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should filter messages by priority', fakeAsync(() => {
      component.filterPriority = 'high' as MessagePriority;
      component.applyFilters();
      tick();
      fixture.detectChanges();

      component.filteredMessages$.subscribe(filtered => {
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('msg2');
      });
      tick();
    }));

    it('should filter messages by search term (subject)', fakeAsync(() => {
      component.searchTerm = 'Update';
      component.applyFiltersDebounced();
      tick(300);
      fixture.detectChanges();

      component.filteredMessages$.subscribe(filtered => {
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('msg2');
      });
      tick();
    }));
    
    it('should filter messages by search term (sender name)', fakeAsync(() => {
      component.searchTerm = 'Sender One';
      component.applyFiltersDebounced();
      tick(300);
      fixture.detectChanges();

      component.filteredMessages$.subscribe(filtered => {
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('msg1');
      });
      tick();
    }));

    it('should combine priority and search term filters', fakeAsync(() => {
      const specificMessages: Message[] = [
        { ...mockMessages[0], priority: 'normal' as MessagePriority, subject: 'Generic Email' }, 
        { ...mockMessages[1], priority: 'high' as MessagePriority, subject: 'Specific High Prio Update' } 
      ];
      (component as any).messagesSubject.next(specificMessages);
      tick(); 
      fixture.detectChanges();

      component.filterPriority = 'high' as MessagePriority;
      component.applyFilters();
      tick();
      fixture.detectChanges();

      component.searchTerm = 'Specific High';
      component.applyFiltersDebounced();
      tick(300);
      fixture.detectChanges();

      component.filteredMessages$.subscribe(filtered => {
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('msg2');
        expect(filtered[0].priority).toBe('high');
        expect(filtered[0].subject).toContain('Specific High');
      });
      tick();
    }));
    
    it('should return all messages if filters are \'all\' and empty term', fakeAsync(() => {
      component.filterPriority = 'all';
      component.applyFilters();
      tick();
      fixture.detectChanges();

      component.searchTerm = '';
      component.applyFiltersDebounced();
      tick(300);
      fixture.detectChanges();
      
      component.filteredMessages$.subscribe(filtered => {
        expect(filtered.length).toBe(2);
      });
      tick();
    }));
  });

  describe('Display Helper Methods', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('getSenderDisplayName should return sender name or fallback', () => {
      expect(component.getSenderDisplayName(mockMessages[0])).toBe('Sender One');
      const noSenderMessage: Message = { ...mockMessages[0], sender: null as any };
      expect(component.getSenderDisplayName(noSenderMessage)).toBe('Système');
    });

    it('getRecipientDisplayName should format recipient names correctly', () => {
      const singleRecipientMsg: Message = { ...mockMessages[0], recipients: [{id: 'r1', name: 'Recip One', role: 'parent'}] };
      expect(component.getRecipientDisplayName(singleRecipientMsg)).toBe('Recip One');

      const twoRecipientsMsg: Message = { ...mockMessages[0], recipients: [
        {id: 'r1', name: 'Recip One', role: 'parent'}, 
        {id: 'r2', name: 'Recip Two', role: 'teacher'}
      ]};
      expect(component.getRecipientDisplayName(twoRecipientsMsg)).toBe('Recip One, Recip Two');

      const manyRecipientsMsg: Message = { ...mockMessages[0], recipients: [
        {id: 'r1', name: 'Recip One', role: 'parent'}, 
        {id: 'r2', name: 'Recip Two', role: 'teacher'},
        {id: 'r3', name: 'Recip Three', role: 'admin'},
        {id: 'r4', name: 'Recip Four', role: 'parent'}
      ]};
      expect(component.getRecipientDisplayName(manyRecipientsMsg)).toBe('Recip One, Recip Two et 2 autres');
      
      const oneOtherRecipientMsg: Message = { ...mockMessages[0], recipients: [
        {id: 'r1', name: 'Recip One', role: 'parent'}, 
        {id: 'r2', name: 'Recip Two', role: 'teacher'},
        {id: 'r3', name: 'Recip Three', role: 'admin'}
      ]};
      expect(component.getRecipientDisplayName(oneOtherRecipientMsg)).toBe('Recip One, Recip Two et 1 autre');

      const noRecipientsMsg: Message = { ...mockMessages[0], recipients: [] };
      expect(component.getRecipientDisplayName(noRecipientsMsg)).toBe('Destinataire inconnu');
      
      const recipientsNoNameMsg: Message = { ...mockMessages[0], recipients: [{id: 'r1', name: null as any, role: 'parent'}] };
      expect(component.getRecipientDisplayName(recipientsNoNameMsg)).toBe('Destinataires inconnus');
    });

    it('isSentByCurrentUser should return true if sender is current user', () => {
      expect(component.isSentByCurrentUser(mockMessages[2])).toBeTrue();
      expect(component.isSentByCurrentUser(mockMessages[0])).toBeFalse();
    });
  });

  describe('Error Handling and Loading States', () => {
    it('should set isLoading during message load and reset on completion', fakeAsync(() => {
      const messagesSubject = new Subject<Message[]>();
      mockMessagingService.getInboxMessages.and.returnValue(messagesSubject.asObservable());
      component.loadMessages();
      expect(component.isLoading).toBeTrue();
      messagesSubject.next(mockMessages);
      tick();
      expect(component.isLoading).toBeFalse();
      messagesSubject.complete();
    }));

    it('should set error and stop loading on getInboxMessages failure', fakeAsync(() => {
      mockMessagingService.getInboxMessages.and.returnValue(throwError(() => new Error('Failed to load')));
      component.loadMessages();
      tick();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe('Erreur lors du chargement des messages.');
      expect(mockToastService.showError).toHaveBeenCalledWith('Erreur lors du chargement des messages.');
      component.messages$.subscribe(messages => expect(messages.length).toBe(0));
    }));
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
