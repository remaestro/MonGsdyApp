import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../../features/notifications/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-badge',
  template: `
    <div class="relative inline-block">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span 
        *ngIf="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
        {{ displayCount }}
      </span>
    </div>
  `,
  styles: []
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  unreadCount: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );

    // Charger le nombre initial
    this.notificationService.refreshUnreadCount();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get displayCount(): string {
    return this.unreadCount > 99 ? '99+' : this.unreadCount.toString();
  }
}
