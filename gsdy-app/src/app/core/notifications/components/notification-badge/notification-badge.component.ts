import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-notification-badge',
  templateUrl: './notification-badge.component.html',
  styleUrls: ['./notification-badge.component.css']
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  notificationCount: string | number = 0;
  private subscription: Subscription | null = null;
  
  // Maximum de notifications à afficher
  private readonly maxDisplayCount: number = 99;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    // S'abonner aux notifications pour calculer le nombre
    this.subscription = this.toastService.toasts$
      .pipe(
        map(toasts => {
          const count = toasts.length;
          // Limiter à maxDisplayCount+ si dépassé
          return count > this.maxDisplayCount ? `${this.maxDisplayCount}+` : count;
        })
      )
      .subscribe(count => {
        this.notificationCount = count;
      });
  }

  ngOnDestroy(): void {
    // Nettoyage pour éviter les fuites de mémoire
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  /**
   * Vérifier si des notifications sont présentes
   */
  hasNotifications(): boolean {
    if (typeof this.notificationCount === 'string') {
      return this.notificationCount.length > 0;
    }
    return this.notificationCount > 0;
  }
}
