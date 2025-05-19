import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Notification } from '../../models/notification.model'; // Corrected import path
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsListComponent implements OnInit {
  notifications$: Observable<Notification[]>;
  isLoading = true;
  error: string | null = null;

  constructor(
    public notificationService: NotificationService, // Made public for template access
    private router: Router
  ) {
    this.notifications$ = this.notificationService.notifications$.pipe(
      tap(() => this.isLoading = false),
      catchError(err => {
        this.error = 'Erreur lors du chargement des notifications.';
        this.isLoading = false;
        console.error(err);
        return of([]); // Return an empty array on error to keep the stream alive
      })
    );
  }

  ngOnInit(): void {
    this.refreshNotifications(); // Initial load
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.markOneAsRead(notification); // Use the component method
    }
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    } else {
      console.log('Notification cliquée, pas de lien direct:', notification);
    }
  }

  markAllAsRead(): void {
    this.isLoading = true;
    this.notificationService.markAllAsRead().pipe(
      tap(() => {
        // Data is updated via BehaviorSubject in service, view should update.
        // Explicit refresh might not be needed if service correctly updates notifications$
        // However, to ensure isLoading is handled correctly:
        this.isLoading = false;
        // Optionally, call refreshNotifications() if direct mutation in service doesn't trigger OnPush consistently
      }),
      catchError(err => {
        this.error = 'Erreur lors du marquage de toutes les notifications comme lues.';
        this.isLoading = false;
        console.error(err);
        return of(null); // Keep stream alive
      })
    ).subscribe();
  }

  getNotificationIcon(notification: Notification): string {
    if (notification.icon) return notification.icon;
    switch (notification.type) {
      case 'message': return 'fas fa-envelope';
      case 'payment': return 'fas fa-file-invoice-dollar';
      case 'event': return 'fas fa-calendar-check';
      case 'document': return 'fas fa-file-alt';
      case 'alert': return 'fas fa-exclamation-triangle';
      // Assuming 'info' is a valid type from your model, if not, adjust or remove
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-bell'; // A generic default icon
    }
  }

  refreshNotifications(): void {
    this.isLoading = true;
    this.error = null; // Reset error on refresh
    // The service's getNotifications() method now triggers a reload and updates notifications$
    this.notificationService.getNotifications().subscribe({
        // isLoading is handled by the tap operator on this.notifications$
        // error is handled by the catchError operator on this.notifications$
    });
  }

  getNotificationTypeColor(type: Notification['type']): string {
    switch (type) {
      case 'alert': // Typically for errors or critical alerts
        return 'danger';
      case 'info': // General information
        return 'info';
      case 'message': // For messages, could be info or primary
        return 'primary';
      case 'payment': // Payments might be success or info
        return 'success';
      case 'event': // Events could be info or a specific color
        return 'warning'; // Example: warning for upcoming events
      case 'document': // Documents might be neutral or info
        return 'secondary';
      default:
        return 'light'; // A neutral default
    }
  }

  markOneAsRead(notification: Notification): void {
    if (!notification.isRead) {
      // No need to set isLoading here unless the operation is very long
      // and you want specific feedback for this single action.
      this.notificationService.markAsRead(notification.id).pipe(
        tap(() => {
          // Notification list updates via BehaviorSubject in the service
        }),
        catchError(err => {
          this.error = `Erreur lors du marquage de la notification ${notification.id} comme lue.`;
          console.error(err);
          // Potentially revert optimistic update if you implemented one
          return of(null); // Keep stream alive
        })
      ).subscribe();
    }
  }

  canBeDismissed(notification: Notification): boolean {
    // Example: Allow dismissing 'info' or 'event' notifications that are read.
    // Or, if all read notifications can be dismissed.
    // This logic should be based on your application's specific requirements.
    if (notification.isRead) {
        switch (notification.type) {
            case 'info':
            case 'event':
            // case 'message': // Uncomment if messages can be dismissed
                return true;
            default:
                return false;
        }
    }
    return false;
  }

  dismissNotification(notificationId: string): void {
    this.isLoading = true; // Show loading indicator for dismiss action
    this.notificationService.deleteNotification(notificationId).pipe(
      tap(() => {
        // List updates via BehaviorSubject in service.
        this.isLoading = false;
        // No need to call refreshNotifications() if service updates the stream correctly.
      }),
      catchError(err => {
        this.error = `Erreur lors de la suppression de la notification ${notificationId}.`;
        this.isLoading = false;
        console.error(err);
        return of(null); // Keep stream alive
      })
    ).subscribe();
  }
}
