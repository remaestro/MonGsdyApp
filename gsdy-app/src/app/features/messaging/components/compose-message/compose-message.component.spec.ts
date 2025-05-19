// filepath: c:\Users\adioyer\source\MonGsdyApp\gsdy-app\src\app\features\messaging\components\compose-message\compose-message.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ComposeMessageComponent } from './compose-message.component';
import { MessagingService } from '../../services/messaging.service';
import { ToastService } from '../../../../core/notifications/services/toast.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Message } from '../../models/message.model';

// Mocks
class MockMessagingService {
  getPotentialRecipients = jasmine.createSpy('getPotentialRecipients').and.returnValue(of([]));
  getMessageById = jasmine.createSpy('getMessageById').and.returnValue(of(undefined));
  getUserById = jasmine.createSpy('getUserById').and.returnValue(of(undefined));
  sendMessage = jasmine.createSpy('sendMessage').and.returnValue(of({} as Message));
  notifyMessageStatusChange = jasmine.createSpy('notifyMessageStatusChange');
}

class MockToastService {
  showSuccess = jasmine.createSpy('showSuccess');
  showError = jasmine.createSpy('showError');
  showWarning = jasmine.createSpy('showWarning');
  showInfo = jasmine.createSpy('showInfo');
}

class MockAuthService {
  currentUser: User | null = { id: 'user1', name: 'Current User', role: 'parent', email: 'current@test.com' };
  getCurrentUserSync = jasmine.createSpy('getCurrentUserSync').and.callFake(() => this.currentUser);
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockActivatedRoute {
  private queryParamsSubject = new Subject<any>();
  queryParams = this.queryParamsSubject.asObservable();
  // Helper to push new queryParams
  setQueryParams(params: any) {
    this.queryParamsSubject.next(params);
  }
}

class MockChangeDetectorRef {
  detectChanges = jasmine.createSpy('detectChanges');
  markForCheck = jasmine.createSpy('markForCheck');
}

describe('ComposeMessageComponent', () => {
  let component: ComposeMessageComponent;
  let fixture: ComponentFixture<ComposeMessageComponent>;
  let mockMessagingService: MockMessagingService;
  let mockToastService: MockToastService;
  let mockAuthService: MockAuthService;
  let mockActivatedRoute: any;
  let router: Router;
  let cdr: ChangeDetectorRef;

  const mockCurrentUser: User = { id: 'currentUser123', name: 'Current User', email: 'current@example.com', role: 'parent' };

  beforeEach(fakeAsync(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParams: {},
        params: {}
      },
      queryParams: of({}),
      params: of({})
    };

    TestBed.configureTestingModule({
      imports: [
        ComposeMessageComponent, // Importer ici pour standalone
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule // Ajouter RouterTestingModule
      ],
      providers: [
        { provide: MessagingService, useClass: MockMessagingService },
        { provide: ToastService, useClass: MockToastService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ]
    }).compileComponents();

    tick(); // Pour la compilation asynchrone

    fixture = TestBed.createComponent(ComposeMessageComponent);
    component = fixture.componentInstance;
    mockMessagingService = TestBed.inject(MessagingService) as unknown as MockMessagingService;
    mockToastService = TestBed.inject(ToastService) as unknown as MockToastService;
    mockAuthService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);

    // Simuler l'utilisateur actuel
    (mockAuthService as any).currentUser = mockCurrentUser;
    (mockAuthService as any).getCurrentUserSync.and.returnValue(mockCurrentUser);
  }));

  it('should create', () => {
    fixture.detectChanges(); // Appel initial
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize the composeForm with default values', () => {
      fixture.detectChanges();
      expect(component.composeForm).toBeDefined();
      expect(component.composeForm.get('subject')?.value).toEqual('');
      expect(component.composeForm.get('content')?.value).toEqual('');
      expect(component.composeForm.get('priority')?.value).toEqual('normal');
      expect(component.composeForm.get('recipientSearch')?.value).toEqual('');
    });

    it('should require subject and content', () => {
      fixture.detectChanges();
      const subjectControl = component.composeForm.get('subject');
      const contentControl = component.composeForm.get('content');

      subjectControl?.setValue('');
      contentControl?.setValue('');
      expect(subjectControl?.valid).toBeFalsy();
      expect(contentControl?.valid).toBeFalsy();

      subjectControl?.setValue('Test Subject');
      contentControl?.setValue('Test Content');
      expect(subjectControl?.valid).toBeTruthy();
      expect(contentControl?.valid).toBeTruthy();
    });
  });

  describe('Recipient Management', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Ensure ngOnInit runs
    });

    it('should add a recipient to selectedRecipients and clear search', () => {
      component.addRecipient(mockCurrentUser);
      expect(component.selectedRecipients).toContain(mockCurrentUser);
      expect(component.composeForm.get('recipientSearch')?.value).toBe('');
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should not add a duplicate recipient', () => {
      component.addRecipient(mockCurrentUser);
      component.addRecipient(mockCurrentUser);
      expect(component.selectedRecipients.length).toBe(1);
    });

    it('should remove a recipient from selectedRecipients', () => {
      component.addRecipient(mockCurrentUser);
      component.removeRecipient(mockCurrentUser);
      expect(component.selectedRecipients).not.toContain(mockCurrentUser);
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should filter recipients based on search term', fakeAsync(() => {
      component.composeForm.get('recipientSearch')?.setValue('Current');
      tick(300); // Debounce time
      fixture.detectChanges();
      
      component.filteredRecipients$.subscribe(recipients => {
        expect(recipients.length).toBe(1);
        expect(recipients[0].name).toBe('Current User');
      });
      tick(); // Complete observable
    }));

     it('should not include selected recipients in filtered results', fakeAsync(() => {
      component.addRecipient(mockCurrentUser);
      component.composeForm.get('recipientSearch')?.setValue('User'); // Should match both if not for filtering
      tick(300);
      fixture.detectChanges();

      component.filteredRecipients$.subscribe(recipients => {
        expect(recipients.length).toBe(0);
        expect(recipients.find(r => r.id === mockCurrentUser.id)).toBeUndefined();
      });
      tick();
    }));
  });

  describe('Reply Mode', () => {
    const mockReplyMessage: Message = {
      id: 'msg123',
      subject: 'Original Subject',
      content: 'Original content',
      sender: { id: 'senderId', name: 'Original Sender', role: 'parent' },
      recipients: [{ id: 'user1', name: 'Current User', role: 'parent' }],
      createdAt: new Date(),
      priority: 'normal'
    };

    beforeEach(() => {
      mockMessagingService.getMessageById.and.returnValue(of(mockReplyMessage));
      mockMessagingService.getUserById.and.returnValue(of({id: 'senderId', name: 'Original Sender', role: 'parent'})); // Mock for sender
    });

    it('should set isReply and prefill subject if replyTo queryParam exists', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({ replyTo: 'msg123' });
      fixture.detectChanges(); // ngOnInit
      tick(); // for async operations in ngOnInit like getMessageById

      expect(component.isReply).toBeTrue();
      expect(component.replyToMessageId).toBe('msg123');
      expect(mockMessagingService.getMessageById).toHaveBeenCalledWith('msg123');
      expect(component.composeForm.get('subject')?.value).toBe('RE: Original Subject');
      expect(component.selectedRecipients.some(r => r.id === 'senderId')).toBeTrue(); // Original sender added
      expect(component.isLoading).toBeFalse();
    }));
    
    it('should use queryParam subject if provided in reply mode', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({ replyTo: 'msg123', subject: 'Custom Reply Subject' });
      fixture.detectChanges();
      tick();

      expect(component.composeForm.get('subject')?.value).toBe('Custom Reply Subject');
    }));

    it('should handle original message not found for reply', fakeAsync(() => {
      mockMessagingService.getMessageById.and.returnValue(of(undefined));
      mockActivatedRoute.queryParams = of({ replyTo: 'msgNonExistent' });
      fixture.detectChanges();
      tick();

      expect(mockToastService.showError).toHaveBeenCalledWith('Message original non trouvé pour la réponse.');
      expect(router.navigate).toHaveBeenCalledWith(['/messaging/compose']);
      expect(component.isLoading).toBeFalse();
    }));
  });
  
  describe('Direct Message Mode (toUserId)', () => {
    const targetUser: User = { id: 'targetUser1', name: 'Target User', role: 'teacher' };
    beforeEach(() => {
        mockMessagingService.getUserById.and.returnValue(of(targetUser));
    });

    it('should add recipient if toUserId queryParam exists', fakeAsync(() => {
        mockActivatedRoute.queryParams = of({ to: 'targetUser1' });
        fixture.detectChanges();
        tick();

        expect(mockMessagingService.getUserById).toHaveBeenCalledWith('targetUser1');
        expect(component.selectedRecipients.length).toBe(1);
        expect(component.selectedRecipients[0].id).toBe('targetUser1');
    }));

    it('should prefill subject if toUserId and subject queryParams exist', fakeAsync(() => {
        mockActivatedRoute.queryParams = of({ to: 'targetUser1', subject: 'Direct Message Subject' });
        fixture.detectChanges();
        tick();
        
        expect(component.composeForm.get('subject')?.value).toBe('Direct Message Subject');
    }));
});


  describe('Attachment Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should add a valid file to attachments', () => {
      const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      const event = { currentTarget: { files: [mockFile] } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.attachments.length).toBe(1);
      expect(component.attachments[0].name).toBe('test.pdf');
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should not add a file exceeding max size', () => {
      const largeFile = new File([''.padStart(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' }); // 6MB
      const event = { currentTarget: { files: [largeFile] } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.attachments.length).toBe(0);
      expect(mockToastService.showError).toHaveBeenCalledWith(`Le fichier ${largeFile.name} est trop volumineux (max 5MB).`);
    });
    
    it('should limit number of attachments to 5', () => {
      const files = [];
      for(let i=0; i<6; i++) {
        files.push(new File([`content${i}`], `test${i}.txt`, {type: 'text/plain'}));
      }
      const event = { currentTarget: { files: files } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.attachments.length).toBe(5);
      expect(mockToastService.showWarning).toHaveBeenCalledWith("Vous ne pouvez joindre que 5 fichiers maximum.");
    });

    it('should remove an attachment', () => {
      const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      component.attachments.push(mockFile);
      component.removeAttachment(0);
      expect(component.attachments.length).toBe(0);
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should format file size correctly', () => {
      expect(component.formatFileSize(0)).toBe('0 Bytes');
      expect(component.formatFileSize(1024)).toBe('1 KB');
      expect(component.formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB'); // 1.5 MB
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.addRecipient(mockCurrentUser); // Add a recipient to make the form potentially valid
      component.composeForm.patchValue({
        subject: 'Test Subject',
        content: 'Test Content'
      });
      fixture.detectChanges();
    });

    it('should not submit if form is invalid (no subject)', () => {
      component.composeForm.get('subject')?.setValue('');
      fixture.detectChanges();
      component.onSubmit();
      expect(mockMessagingService.sendMessage).not.toHaveBeenCalled();
      expect(mockToastService.showError).toHaveBeenCalledWith("Veuillez corriger les erreurs dans le formulaire.");
    });
    
    it('should not submit if form is invalid (no content)', () => {
      component.composeForm.get('content')?.setValue('');
      fixture.detectChanges();
      component.onSubmit();
      expect(mockMessagingService.sendMessage).not.toHaveBeenCalled();
      expect(mockToastService.showError).toHaveBeenCalledWith("Veuillez corriger les erreurs dans le formulaire.");
    });

    it('should not submit if no recipients are selected', () => {
      component.selectedRecipients = []; // Remove recipient
      fixture.detectChanges();
      component.onSubmit();
      expect(mockMessagingService.sendMessage).not.toHaveBeenCalled();
      expect(mockToastService.showError).toHaveBeenCalledWith("Veuillez corriger les erreurs dans le formulaire.");
      expect(component.error).toBe("Veuillez sélectionner au moins un destinataire.");
    });

    it('should call sendMessage on valid submission', fakeAsync(() => {
      const mockSentMessage: Message = { id: 'sentMsg1', subject: 'Test Subject', content: 'Test Content', sender: {id: 'user1', name: 'Current User', role: 'parent'}, recipients: [{id: mockCurrentUser.id, name: mockCurrentUser.name, role: mockCurrentUser.role}], createdAt: new Date() };
      mockMessagingService.sendMessage.and.returnValue(of(mockSentMessage));
      mockAuthService.currentUser = { id: 'user1', name: 'Current User', role: 'parent' }; // Ensure current user for notify

      component.onSubmit();
      tick(); // for finalize and other async operations

      expect(mockMessagingService.sendMessage).toHaveBeenCalled();
      const sendMessageArgs = mockMessagingService.sendMessage.calls.mostRecent().args;
      expect(sendMessageArgs[0].subject).toBe('Test Subject');
      expect(sendMessageArgs[0].recipients[0].id).toBe(mockCurrentUser.id);
      expect(sendMessageArgs[1]).toEqual(component.attachments); // attachments array

      expect(mockToastService.showSuccess).toHaveBeenCalledWith('Message envoyé avec succès !');
      expect(component.composeForm.get('subject')?.value).toBeNull(); // Form reset
      expect(component.selectedRecipients.length).toBe(0);
      expect(mockMessagingService.notifyMessageStatusChange).toHaveBeenCalledWith('new_sent_message', 'user1');
      expect(router.navigate).toHaveBeenCalledWith(['/messaging/inbox']);
      expect(component.isSending).toBeFalse();
    }));

    it('should handle error on sendMessage failure', fakeAsync(() => {
      mockMessagingService.sendMessage.and.returnValue(throwError(() => new Error('Send failed')));
      component.onSubmit();
      tick();

      expect(mockMessagingService.sendMessage).toHaveBeenCalled();
      expect(mockToastService.showError).toHaveBeenCalledWith('Échec de l\'envoi du message. Veuillez réessayer.');
      expect(component.error).toBe('Échec de l\'envoi du message. Veuillez réessayer.');
      expect(component.isSending).toBeFalse();
    }));
  });
  
  describe('Cancel Navigation', () => {
    it('should navigate to inbox on cancel', () => {
      fixture.detectChanges();
      component.cancel();
      expect(router.navigate).toHaveBeenCalledWith(['/messaging/inbox']);
    });
  });
});
