import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import { NotificationsListComponent } from './notifications-list.component';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { Router } from '@angular/router';

// Mock NotificationService
class MockNotificationService {
  notifications$ = new BehaviorSubject<Notification[]>([]);
  unreadCount$ = new BehaviorSubject<number>(0);
  getNotifications = jasmine.createSpy('getNotifications').and.returnValue(of([]));
  markAsRead = jasmine.createSpy('markAsRead').and.returnValue(of({}));
  markAllAsRead = jasmine.createSpy('markAllAsRead').and.returnValue(of(null));
  deleteNotification = jasmine.createSpy('deleteNotification').and.returnValue(of(null));
  refreshUnreadCount = jasmine.createSpy('refreshUnreadCount');
}

describe('NotificationsListComponent', () => {
  let component: NotificationsListComponent;
  let fixture: ComponentFixture<NotificationsListComponent>;
  let notificationService: MockNotificationService;
  let router: Router;

  const mockNotifications: Notification[] = [
    { id: '1', userId: 'user1', type: 'info', title: 'Info 1', message: 'This is an info', isRead: false, createdAt: new Date(), icon: 'fas fa-info-circle' },
    { id: '2', userId: 'user1', type: 'alert', title: 'Alert 1', message: 'This is an alert', isRead: true, createdAt: new Date(), readAt: new Date(), link: '/alerts/2' },
    { id: '3', userId: 'user1', type: 'message', title: 'Message 1', message: 'New message', isRead: false, createdAt: new Date(), link: '/messages/3', icon: 'fas fa-envelope' },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NotificationsListComponent, 
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule, 
      ],
      providers: [
        { provide: NotificationService, useClass: MockNotificationService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(NotificationsListComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsListComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService) as unknown as MockNotificationService;
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.stub();
    
    notificationService.getNotifications.calls.reset();
    notificationService.markAsRead.calls.reset();
    notificationService.markAllAsRead.calls.reset();
    notificationService.deleteNotification.calls.reset();
    notificationService.refreshUnreadCount.calls.reset();
    (router.navigateByUrl as jasmine.Spy).calls.reset();

    notificationService.notifications$.next([...mockNotifications]);
    notificationService.unreadCount$.next(mockNotifications.filter(n => !n.isRead).length);
  });

  it('should create', () => {
    fixture.detectChanges(); // Déclencher ngOnInit
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call refreshNotifications on ngOnInit and subscribe to notifications$', fakeAsync(() => {
      // Mock getNotifications pour qu'il mette à jour le BehaviorSubject du service
      notificationService.getNotifications.and.callFake(() => {
        notificationService.notifications$.next([...mockNotifications]);
        return of([...mockNotifications]); // L'observable retourné par getNotifications lui-même
      });

      fixture.detectChanges(); // Déclenche ngOnInit, qui appelle refreshNotifications
      tick(); // Pour la souscription à getNotifications dans refreshNotifications
      fixture.detectChanges(); // Mettre à jour la vue

      expect(notificationService.getNotifications).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
      
      let currentNotifications: Notification[] = [];
      component.notifications$.subscribe(n => currentNotifications = n);
      tick(); // S'assurer que la souscription est traitée
      expect(currentNotifications.length).toBe(mockNotifications.length);
    }));

    it('should handle error when loading notifications via refreshNotifications', fakeAsync(() => {
      const errorMsg = 'Failed to load notifications';
      notificationService.getNotifications.and.returnValue(throwError(() => new Error(errorMsg)));

      fixture.detectChanges(); // Déclenche ngOnInit -> refreshNotifications
      tick(); // Pour la souscription à getNotifications qui échoue
      fixture.detectChanges(); // Mettre à jour la vue

      expect(notificationService.getNotifications).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse(); // Doit être false après l'erreur
      expect(component.error).toBe('Erreur lors du chargement des notifications.');
      
      let currentNotifications: Notification[] = [];
      component.notifications$.subscribe(n => currentNotifications = n); // notifications$ devrait émettre [] à cause de catchError
      tick(); // S'assurer que la souscription est traitée
      expect(currentNotifications.length).toBe(0);
    }));
  });

  describe('User Interactions', () => {
    let currentNotificationsValue: Notification[];
    beforeEach(fakeAsync(() => {
      // Assurer que les données initiales sont chargées et que la vue est stable
      notificationService.getNotifications.and.callFake(() => {
        notificationService.notifications$.next([...mockNotifications]);
        return of([...mockNotifications]);
      });
      fixture.detectChanges(); // ngOnInit
      tick(); // pour refreshNotifications
      fixture.detectChanges(); // Mettre à jour la vue
      // S'abonner ici pour obtenir la valeur actuelle pour les assertions
      component.notifications$.subscribe(value => currentNotificationsValue = value);
      tick(); // Traiter la souscription
    }));

    it('should mark notification as read and navigate if link exists on handleNotificationClick', () => {
      const unreadNotificationWithLink = { ...mockNotifications[2], isRead: false }; // id: '3', link: '/messages/3'
      const alreadyReadNotificationWithLink = { ...mockNotifications[1] }; // id: '2', link: '/alerts/2', isRead: true
      
      spyOn(component, 'markOneAsRead').and.callThrough();
      notificationService.markAsRead.and.callFake((id: string) => {
        const notif = notificationService.notifications$.value.find(n => n.id === id);
        if (notif) notif.isRead = true;
        notificationService.notifications$.next([...notificationService.notifications$.value]);
        return of({ ...notif, isRead: true } as Notification);
      });

      component.handleNotificationClick(unreadNotificationWithLink);
      expect(component.markOneAsRead).toHaveBeenCalledWith(unreadNotificationWithLink);
      expect(notificationService.markAsRead).toHaveBeenCalledWith(unreadNotificationWithLink.id);
      expect(router.navigateByUrl).toHaveBeenCalledWith(unreadNotificationWithLink.link!);

      (component.markOneAsRead as jasmine.Spy).calls.reset();
      (notificationService.markAsRead as jasmine.Spy).calls.reset();
      (router.navigateByUrl as jasmine.Spy).calls.reset();

      component.handleNotificationClick(alreadyReadNotificationWithLink);
      expect(component.markOneAsRead).not.toHaveBeenCalled(); // Déjà lue
      expect(router.navigateByUrl).toHaveBeenCalledWith(alreadyReadNotificationWithLink.link!);
    });
    
    it('should only mark as read if no link on handleNotificationClick for unread notification', () => {
      const unreadNotificationNoLink = { ...mockNotifications[0], isRead: false }; // id: '1', no link
      spyOn(component, 'markOneAsRead').and.callThrough();
      notificationService.markAsRead.and.callFake((id: string) => {
        const notif = notificationService.notifications$.value.find(n => n.id === id);
        if (notif) notif.isRead = true;
        notificationService.notifications$.next([...notificationService.notifications$.value]);
        return of({ ...notif, isRead: true } as Notification);
      });

      component.handleNotificationClick(unreadNotificationNoLink);
      expect(component.markOneAsRead).toHaveBeenCalledWith(unreadNotificationNoLink);
      expect(notificationService.markAsRead).toHaveBeenCalledWith(unreadNotificationNoLink.id);
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should call notificationService.markAllAsRead and refresh on markAllAsRead', fakeAsync(() => {
      notificationService.markAllAsRead.and.callFake(() => {
        const currentNotifs = notificationService.notifications$.value.map(n => ({...n, isRead: true}));
        notificationService.notifications$.next(currentNotifs);
        notificationService.refreshUnreadCount(); // Simuler le comportement du service
        return of(null);
      });

      component.markAllAsRead();
      tick(); // Pour la souscription à markAllAsRead
      fixture.detectChanges();

      expect(notificationService.markAllAsRead).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse(); 
      const allRead = currentNotificationsValue.every((n: Notification) => n.isRead);
      expect(allRead).toBeTrue();
    }));
    
    it('should handle error on markAllAsRead', fakeAsync(() => {
      notificationService.markAllAsRead.and.returnValue(throwError(() => new Error('Failed to mark all as read')));
      component.markAllAsRead();
      tick();
      fixture.detectChanges();
      expect(component.error).toBe('Erreur lors du marquage de toutes les notifications comme lues.');
      expect(component.isLoading).toBeFalse();
    }));

    it('should call notificationService.markAsRead on markOneAsRead and update UI', fakeAsync(() => {
       const notificationToMark = { ...mockNotifications[0], isRead: false }; // Unread, id: '1'
       notificationService.markAsRead.and.callFake((id: string) => {
         const updatedNotifs = notificationService.notifications$.value.map(n => 
           n.id === id ? {...n, isRead: true} : n
         );
         notificationService.notifications$.next(updatedNotifs);
         notificationService.refreshUnreadCount();
         return of(updatedNotifs.find(n => n.id === id)!);
       });

       component.markOneAsRead(notificationToMark);
       tick(); // Pour la souscription à markAsRead
       fixture.detectChanges();

       expect(notificationService.markAsRead).toHaveBeenCalledWith(notificationToMark.id);
       const markedNotification = currentNotificationsValue.find((n: Notification) => n.id === notificationToMark.id);
       expect(markedNotification?.isRead).toBeTrue();
       expect(component.isLoading).toBeFalse();
    }));
    
    it('should handle error on markOneAsRead', fakeAsync(() => {
      const notificationToMark = mockNotifications[0];
      notificationService.markAsRead.and.returnValue(throwError(() => new Error('Failed')));
      component.markOneAsRead(notificationToMark);
      tick();
      fixture.detectChanges();
      expect(component.error).toContain(`Erreur lors du marquage de la notification ${notificationToMark.id} comme lue.`);
      expect(component.isLoading).toBeFalse();
    }));

    it('should call notificationService.deleteNotification and update UI on dismissNotification', fakeAsync(() => {
      const notificationIdToDismiss = mockNotifications[0].id; // '1'
      notificationService.deleteNotification.and.callFake((id: string) => {
        const remainingNotifs = notificationService.notifications$.value.filter(n => n.id !== id);
        notificationService.notifications$.next(remainingNotifs);
        notificationService.refreshUnreadCount();
        return of(null);
      });

      component.dismissNotification(notificationIdToDismiss);
      tick(); // Pour la souscription à deleteNotification
      fixture.detectChanges();

      expect(notificationService.deleteNotification).toHaveBeenCalledWith(notificationIdToDismiss);
      const dismissedNotification = currentNotificationsValue.find((n: Notification) => n.id === notificationIdToDismiss);
      expect(dismissedNotification).toBeUndefined();
      expect(component.isLoading).toBeFalse();
    }));
    
    it('should handle error on dismissNotification', fakeAsync(() => {
      const notificationIdToDismiss = '1';
      notificationService.deleteNotification.and.returnValue(throwError(() => new Error('Failed')));
      component.dismissNotification(notificationIdToDismiss);
      tick();
      fixture.detectChanges();
      expect(component.error).toContain(`Erreur lors de la suppression de la notification ${notificationIdToDismiss}.`);
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('UI Helper methods', () => {
    it('getNotificationIcon should return notification.icon if present', () => {
      const notificationWithIcon = mockNotifications[2];
      expect(component.getNotificationIcon(notificationWithIcon)).toBe(notificationWithIcon.icon!);
    });

    it('getNotificationIcon should return icon based on type if notification.icon is not present', () => {
      const notificationInfo = { ...mockNotifications[0], icon: undefined };
      const notificationAlert = { ...mockNotifications[1], icon: undefined };
      expect(component.getNotificationIcon(notificationInfo)).toBe('fas fa-info-circle');
      expect(component.getNotificationIcon(notificationAlert)).toBe('fas fa-exclamation-triangle');
    });
    
    it('getNotificationIcon should return default icon for unknown type', () => {
      const notificationUnknown = { ...mockNotifications[0], type: 'unknown' as any, icon: undefined };
      expect(component.getNotificationIcon(notificationUnknown)).toBe('fas fa-bell');
    });

    it('getNotificationTypeColor should return correct color for type', () => {
      expect(component.getNotificationTypeColor('alert')).toBe('danger');
      expect(component.getNotificationTypeColor('info')).toBe('info');
      expect(component.getNotificationTypeColor('message')).toBe('primary');
      expect(component.getNotificationTypeColor('payment')).toBe('success');
      expect(component.getNotificationTypeColor('event')).toBe('warning');
      expect(component.getNotificationTypeColor('document')).toBe('secondary');
      expect(component.getNotificationTypeColor('unknown' as any)).toBe('light');
    });

    it('canBeDismissed should return true for read "info" or "event" notifications', () => {
      const infoRead: Notification = { ...mockNotifications[0], type: 'info', isRead: true };
      const eventRead: Notification = { ...mockNotifications[0], type: 'event', isRead: true };
      const infoUnread: Notification = { ...mockNotifications[0], type: 'info', isRead: false };
      const alertRead: Notification = { ...mockNotifications[1], type: 'alert', isRead: true };

      expect(component.canBeDismissed(infoRead)).toBeTrue();
      expect(component.canBeDismissed(eventRead)).toBeTrue();
      expect(component.canBeDismissed(infoUnread)).toBeFalse();
      expect(component.canBeDismissed(alertRead)).toBeFalse();
    });
  });
  
  describe('Template Rendering', () => {
    it('should display notifications when notifications$ emits', fakeAsync(() => {
      notificationService.notifications$.next(mockNotifications); // Use next for BehaviorSubject
      notificationService.getNotifications.and.returnValue(of(mockNotifications));
      
      component.ngOnInit(); // Triggers refreshNotifications
      fixture.detectChanges(); // Initial data binding
      tick(); // Settle observables
      fixture.detectChanges(); // Re-bind after data is loaded

      const notificationElements = fixture.debugElement.queryAll(By.css('.notification-item')); // Adjust selector based on your HTML
      expect(notificationElements.length).toBe(mockNotifications.length);
    }));

    it('should display loading indicator when isLoading is true', () => {
      component.isLoading = true;
      fixture.detectChanges();
      const loadingElement = fixture.debugElement.query(By.css('div.text-center > span[role="status"]')); // Adjust selector
      expect(loadingElement).toBeTruthy();
    });
    
    it('should display error message when error is present', () => {
      component.error = 'Test Error Message';
      fixture.detectChanges();
      const errorElement = fixture.debugElement.query(By.css('.alert-danger')); // Adjust selector
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent).toContain('Test Error Message');
    });
  });
});
