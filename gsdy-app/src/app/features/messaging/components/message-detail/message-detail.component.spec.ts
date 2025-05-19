import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MessageDetailComponent } from './message-detail.component';
import { MessagingService } from '../../services/messaging.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastService } from '../../../../core/notifications/services/toast.service';
import { User } from '../../../../core/models/user.model';
import { Message, MessagePriority, Attachment } from '../../models/message.model';

// Mocks
class MockMessagingService {
  getMessageById = jasmine.createSpy('getMessageById').and.returnValue(of(null));
  markAsRead = jasmine.createSpy('markAsRead').and.returnValue(of(true));
  markAsUnread = jasmine.createSpy('markAsUnread').and.returnValue(of(true));
  deleteMessage = jasmine.createSpy('deleteMessage').and.returnValue(of(true));
  notifyMessageStatusChange = jasmine.createSpy('notifyMessageStatusChange');
}

class MockAuthService {
  currentUser: User | null = { id: 'user123', name: 'Test User', role: 'parent', email: 'test@example.com' };
  getCurrentUserSync = jasmine.createSpy('getCurrentUserSync').and.callFake(() => this.currentUser);
}

class MockToastService {
  showSuccess = jasmine.createSpy('showSuccess');
  showError = jasmine.createSpy('showError');
}

class MockLocation {
  back = jasmine.createSpy('back');
}

const mockMessage: Message = {
  id: 'msg1',
  subject: 'Test Message Subject',
  content: 'This is the content of the test message.',
  sender: { id: 'sender1', name: 'Sender User', role: 'teacher' },
  recipients: [{ id: 'user123', name: 'Test User', role: 'parent' }],
  createdAt: new Date('2024-05-18T10:00:00Z'),
  isRead: false,
  priority: 'normal' as MessagePriority,
  attachments: [
    { id: 'att1', fileName: 'document.pdf', fileType: 'application/pdf', fileUrl: '/uploads/document.pdf', size: 1024 }
  ]
};

const mockMessageRead: Message = { ...mockMessage, isRead: true, readAt: new Date() };
const mockMessageFromOtherSender: Message = { ...mockMessage, sender: {id: 'sender2', name: 'Another Sender', role: 'admin'} };


describe('MessageDetailComponent', () => {
  let component: MessageDetailComponent;
  let fixture: ComponentFixture<MessageDetailComponent>;
  let messagingService: MockMessagingService;
  let authService: MockAuthService;
  let toastService: MockToastService;
  let router: Router;
  let location: MockLocation;
  let activatedRoute: ActivatedRoute;
  let cdr: ChangeDetectorRef;

  const configureTestingModule = (messageIdParam: string | null, currentUser: User | null = authService.currentUser) => {
    authService.currentUser = currentUser; // Set current user for this test suite

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]), // Important for router.navigate
      ],
      declarations: [MessageDetailComponent], // Add MessageDetailComponent to declarations
      providers: [
        { provide: MessagingService, useClass: MockMessagingService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: ToastService, useClass: MockToastService },
        { provide: Location, useClass: MockLocation },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => messageIdParam })
          }
        },
        // ChangeDetectorRef will be injected from the fixture
      ]
    })
    // Override ChangeDetectionStrategy for testing if needed
    // .overrideComponent(MessageDetailComponent, {
    //   set: { changeDetection: ChangeDetectionStrategy.Default }
    // })
    .compileComponents();

    fixture = TestBed.createComponent(MessageDetailComponent);
    component = fixture.componentInstance;
    messagingService = TestBed.inject(MessagingService) as unknown as MockMessagingService;
    // authService is already an instance of MockAuthService
    toastService = TestBed.inject(ToastService) as unknown as MockToastService;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location) as unknown as MockLocation;
    activatedRoute = TestBed.inject(ActivatedRoute);
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);

    spyOn(router, 'navigate'); // Spy on router navigation
  };

  beforeEach(() => {
    // Reset spies and services for each test
    authService = new MockAuthService(); // New instance for each describe block
    messagingService = new MockMessagingService();
    toastService = new MockToastService();
    location = new MockLocation();
  });

  describe('Initialization and Message Loading', () => {
    it('should create and load message if id is provided in route params', fakeAsync(() => {
      configureTestingModule(mockMessage.id);
      messagingService.getMessageById.and.returnValue(of(mockMessage));
      
      fixture.detectChanges(); // ngOnInit
      tick(); // Resolve getMessageById observable

      expect(component).toBeTruthy();
      expect(messagingService.getMessageById).toHaveBeenCalledWith(mockMessage.id);
      expect(component.message?.id).toEqual(mockMessage.id);
      expect(component.message?.subject).toEqual(mockMessage.subject);
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
    }));

    it('should mark message as read if it is unread and current user is a recipient', fakeAsync(() => {
      configureTestingModule(mockMessage.id);
      const unreadMessage = { ...mockMessage, isRead: false };
      messagingService.getMessageById.and.returnValue(of(unreadMessage));
      messagingService.markAsRead.and.returnValue(of(true));

      fixture.detectChanges();
      tick();

      expect(messagingService.markAsRead).toHaveBeenCalledWith(unreadMessage.id);
      expect(component.message?.isRead).toBeTrue();
      expect(messagingService.notifyMessageStatusChange).toHaveBeenCalledWith(unreadMessage.id, 'read');
    }));

    it('should NOT mark message as read if already read', fakeAsync(() => {
      configureTestingModule(mockMessageRead.id);
      messagingService.getMessageById.and.returnValue(of(mockMessageRead));
      
      fixture.detectChanges();
      tick();

      expect(messagingService.markAsRead).not.toHaveBeenCalled();
    }));

    it('should NOT mark message as read if current user is not a recipient', fakeAsync(() => {
      const messageForOther: Message = { ...mockMessage, recipients: [{id: 'otherUser', name: 'Other User', role: 'parent'}] };
      configureTestingModule(messageForOther.id);
      messagingService.getMessageById.and.returnValue(of(messageForOther));
      
      fixture.detectChanges();
      tick();

      expect(messagingService.markAsRead).not.toHaveBeenCalled();
    }));
    
    it('should set error if message ID is not provided', fakeAsync(() => {
      configureTestingModule(null);
      fixture.detectChanges(); // ngOnInit
      tick();
    
      expect(component.error).toBe('ID de message non fourni.');
      expect(component.isLoading).toBeFalse();
      expect(messagingService.getMessageById).not.toHaveBeenCalled();
    }));

    it('should set error if getMessageById returns null (message not found)', fakeAsync(() => {
      configureTestingModule(mockMessage.id);
      messagingService.getMessageById.and.returnValue(of(null));
      
      fixture.detectChanges();
      tick();

      expect(component.error).toBe('Message non trouvé.');
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle error if getMessageById fails', fakeAsync(() => {
      configureTestingModule(mockMessage.id);
      messagingService.getMessageById.and.returnValue(throwError(() => new Error('API Error')));
      
      fixture.detectChanges();
      tick();

      expect(component.error).toBe('Erreur lors du chargement du message.');
      expect(toastService.showError).toHaveBeenCalledWith('Erreur lors du chargement du message.');
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('User Actions', () => {
    beforeEach(fakeAsync(() => { // Wrap with fakeAsync
      configureTestingModule(mockMessage.id);
      messagingService.getMessageById.and.returnValue(of(mockMessage));
      fixture.detectChanges(); // Initial load
      tick(); // Ensure message is loaded
    })); // Close fakeAsync

    it('should navigate to reply page on replyToMessage()', () => {
      if (!component.message) fail('Message not loaded');
      component.replyToMessage();
      if (component.message) {
        expect(router.navigate).toHaveBeenCalledWith(['/messaging/compose'], { 
          queryParams: { 
            replyTo: component.message.id,
            to: component.message.sender.id,
            subject: `RE: ${component.message.subject}`
          } 
        });
      }
    });

    it('should navigate to forward page on forwardMessage()', () => {
      if (!component.message) fail('Message not loaded');
      component.forwardMessage();
      if (component.message) {
        expect(router.navigate).toHaveBeenCalledWith(['/messaging/compose'], { 
          queryParams: { 
            forwardOf: component.message.id,
            subject: `Fwd: ${component.message.subject}`,
            content: jasmine.any(String) // Check that content is passed
          } 
        });
        const navigationArgs = (router.navigate as jasmine.Spy).calls.mostRecent().args[1];
        expect(navigationArgs.queryParams.content).toContain(mockMessage.content);
        expect(navigationArgs.queryParams.content).toContain(mockMessage.sender.name);
      }
    });
    
    it('should call location.back() on goBack()', () => {
      component.goBack();
      expect(location.back).toHaveBeenCalled();
    });

    describe('deleteMessage()', () => {
      it('should call messagingService.deleteMessage and navigate on success', fakeAsync(() => {
        if (!component.message) fail('Message not loaded');
        messagingService.deleteMessage.and.returnValue(of(true));
        spyOn(window, 'confirm').and.returnValue(true); // Mock confirm dialog

        component.deleteMessage();
        tick();

        expect(messagingService.deleteMessage).toHaveBeenCalledWith(mockMessage.id);
        expect(toastService.showSuccess).toHaveBeenCalledWith('Message supprimé avec succès.');
        expect(router.navigate).toHaveBeenCalledWith(['/messaging/inbox']);
        expect(messagingService.notifyMessageStatusChange).toHaveBeenCalledWith(mockMessage.id, 'deleted');
      }));

      it('should show error toast if deleteMessage fails', fakeAsync(() => {
        if (!component.message) fail('Message not loaded');
        messagingService.deleteMessage.and.returnValue(of(false)); 
        spyOn(window, 'confirm').and.returnValue(true);

        component.deleteMessage();
        tick();
        
        expect(toastService.showError).toHaveBeenCalledWith('Erreur lors de la suppression du message.');
        expect(router.navigate).not.toHaveBeenCalledWith(['/messaging/inbox']);
      }));
      
      it('should show error toast and not navigate if deleteMessage throws error', fakeAsync(() => {
        if (!component.message) fail('Message not loaded');
        messagingService.deleteMessage.and.returnValue(throwError(() => new Error('API Error')));
        spyOn(window, 'confirm').and.returnValue(true);

        component.deleteMessage();
        tick();
        
        expect(toastService.showError).toHaveBeenCalledWith('Erreur lors de la suppression du message.');
        expect(router.navigate).not.toHaveBeenCalledWith(['/messaging/inbox']);
      }));

      it('should not call deleteMessage if user cancels confirmation', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        component.deleteMessage();
        expect(messagingService.deleteMessage).not.toHaveBeenCalled();
      });
    });

    describe('toggleReadStatus()', () => {
      it('should mark as unread if currently read', fakeAsync(() => {
        component.message = { ...mockMessageRead }; // Ensure message is read
        messagingService.markAsUnread.and.returnValue(of(true));
        
        component.toggleReadStatus();
        tick();

        expect(messagingService.markAsUnread).toHaveBeenCalledWith(mockMessageRead.id);
        expect(component.message?.isRead).toBeFalse();
        expect(toastService.showSuccess).toHaveBeenCalledWith('Message marqué comme non lu.');
        expect(messagingService.notifyMessageStatusChange).toHaveBeenCalledWith(mockMessageRead.id, 'unread');
      }));

      it('should mark as read if currently unread', fakeAsync(() => {
        component.message = { ...mockMessage, isRead: false }; // Ensure message is unread
        messagingService.markAsRead.and.returnValue(of(true));
        
        component.toggleReadStatus();
        tick();

        expect(messagingService.markAsRead).toHaveBeenCalledWith(mockMessage.id);
        expect(component.message?.isRead).toBeTrue();
        expect(toastService.showSuccess).toHaveBeenCalledWith('Message marqué comme lu.');
        expect(messagingService.notifyMessageStatusChange).toHaveBeenCalledWith(mockMessage.id, 'read');
      }));
      
      it('should show error if toggling read status fails (markAsUnread)', fakeAsync(() => {
        component.message = { ...mockMessageRead };
        messagingService.markAsUnread.and.returnValue(of(false));
        
        component.toggleReadStatus();
        tick();
        
        expect(toastService.showError).toHaveBeenCalledWith('Erreur lors de la mise à jour du statut du message.');
      }));

      it('should show error if toggling read status fails (markAsRead)', fakeAsync(() => {
        component.message = { ...mockMessage, isRead: false };
        messagingService.markAsRead.and.returnValue(of(false));
        
        component.toggleReadStatus();
        tick();
        
        expect(toastService.showError).toHaveBeenCalledWith('Erreur lors de la mise à jour du statut du message.');
      }));
    });
  });

  describe('Display Logic', () => {
    beforeEach(() => {
      configureTestingModule(mockMessage.id);
    });

    it('isSentByCurrentUser should return true if current user is the sender', () => {
      authService.currentUser = { id: 'sender1', name: 'Sender User', role: 'teacher', email: 'sender@example.com' };
      component.currentUser = authService.currentUser; // Update component's currentUser
      component.message = mockMessage;
      expect(component.isSentByCurrentUser()).toBeTrue();
    });

    it('isSentByCurrentUser should return false if current user is not the sender', () => {
      authService.currentUser = { id: 'user123', name: 'Test User', role: 'parent', email: 'test@example.com' };
      component.currentUser = authService.currentUser;
      component.message = mockMessage;
      expect(component.isSentByCurrentUser()).toBeFalse();
    });
    
    it('isSentByCurrentUser should return false if message or sender is null', () => {
      component.message = null;
      expect(component.isSentByCurrentUser()).toBeFalse();
      
      component.message = { ...mockMessage, sender: null as any };
      expect(component.isSentByCurrentUser()).toBeFalse();
    });

    it('getSenderDisplayName should return sender name or fallback', () => {
      component.message = mockMessage;
      expect(component.getSenderDisplayName()).toBe('Sender User');
      
      component.message = { ...mockMessage, sender: { ...mockMessage.sender, name: ''} };
      expect(component.getSenderDisplayName()).toBe('Utilisateur inconnu');

      component.message = { ...mockMessage, sender: null as any };
      expect(component.getSenderDisplayName()).toBe('Système');
    });

    it('getRecipientDisplayNames should format recipient names correctly', () => {
      component.message = mockMessage; // Single recipient
      expect(component.getRecipientDisplayNames()).toBe('Test User');

      const multiRecipientMessage: Message = { 
        ...mockMessage, 
        recipients: [
          { id: 'user123', name: 'Test User', role: 'parent' },
          { id: 'user456', name: 'Another User', role: 'teacher' }
        ]
      };
      component.message = multiRecipientMessage;
      expect(component.getRecipientDisplayNames()).toBe('Test User, Another User');
      
      const noNameRecipientMessage: Message = { 
        ...mockMessage, 
        recipients: [ { id: 'user789', name: '', role: 'admin' } ]
      };
      component.message = noNameRecipientMessage;
      expect(component.getRecipientDisplayNames()).toBe('Destinataire inconnu');

      component.message = { ...mockMessage, recipients: [] };
      expect(component.getRecipientDisplayNames()).toBe('Aucun destinataire');
      
      component.message = { ...mockMessage, recipients: null as any };
      expect(component.getRecipientDisplayNames()).toBe('Aucun destinataire');
    });
  });
  
  describe('Attachment Handling', () => {
    beforeEach(fakeAsync(() => {
      configureTestingModule(mockMessage.id);
      messagingService.getMessageById.and.returnValue(of(mockMessage));
      fixture.detectChanges();
      tick();
    }));

    it('should download attachment', fakeAsync(() => {
      if (!component.message || !component.message.attachments || component.message.attachments.length === 0) {
        fail('Message with attachments not loaded');
        return;
      }
      const attachment = component.message.attachments[0];
      const blob = new Blob(['fake content'], { type: attachment.fileType });
      spyOn(window, 'fetch').and.resolveTo(new Response(blob));
      spyOn(window.URL, 'createObjectURL').and.callFake(obj => 'blob:http://localhost/fake-url');
      spyOn(window.URL, 'revokeObjectURL');
      const link = jasmine.createSpyObj('a', ['click', 'setAttribute', 'removeAttribute']);
      spyOn(document, 'createElement').and.returnValue(link);

      component.downloadAttachment(attachment);
      tick();

      expect(window.fetch).toHaveBeenCalledWith(attachment.fileUrl);
      expect(link.href).toBe('blob:http://localhost/fake-url');
      expect(link.download).toBe(attachment.fileName);
      expect(link.click).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/fake-url');
    }));

    it('should show error if download fails', fakeAsync(() => {
      if (!component.message || !component.message.attachments || component.message.attachments.length === 0) {
        fail('Message with attachments not loaded');
        return;
      }
      const attachment = component.message.attachments[0];
      spyOn(window, 'fetch').and.rejectWith(new Error('Network error'));

      component.downloadAttachment(attachment);
      tick();

      expect(toastService.showError).toHaveBeenCalledWith('Erreur lors du téléchargement de la pièce jointe.');
    }));
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      configureTestingModule(mockMessage.id);
      fixture.detectChanges(); // ngOnInit
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
