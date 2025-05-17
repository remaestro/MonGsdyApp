import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';
import { ToastService } from '../../../../core/notifications/services/toast.service';

@Component({
  selector: 'app-notification-list',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Notifications</h1>
        
        <div class="flex space-x-2">
          <button 
            *ngIf="unreadCount > 0"
            (click)="markAllAsRead()"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Tout marquer comme lu
          </button>
        </div>
      </div>
      
      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex flex-wrap gap-2">
          <button 
            [ngClass]="{'bg-blue-600 text-white': activeFilter === 'all', 'bg-gray-200 text-gray-700': activeFilter !== 'all'}"
            (click)="filterNotifications('all')"
            class="px-4 py-2 rounded text-sm font-medium transition">
            Toutes
          </button>
          <button 
            [ngClass]="{'bg-blue-600 text-white': activeFilter === 'unread', 'bg-gray-200 text-gray-700': activeFilter !== 'unread'}"
            (click)="filterNotifications('unread')"
            class="px-4 py-2 rounded text-sm font-medium transition">
            Non lues
          </button>
          <button 
            [ngClass]="{'bg-blue-600 text-white': activeFilter === 'info', 'bg-gray-200 text-gray-700': activeFilter !== 'info'}"
            (click)="filterNotifications('info')"
            class="px-4 py-2 rounded text-sm font-medium transition">
            Informations
          </button>
          <button 
            [ngClass]="{'bg-blue-600 text-white': activeFilter === 'warning', 'bg-gray-200 text-gray-700': activeFilter !== 'warning'}"
            (click)="filterNotifications('warning')"
            class="px-4 py-2 rounded text-sm font-medium transition">
            Alertes
          </button>
        </div>
      </div>
      
      <!-- Loading state -->
      <div *ngIf="loading" class="flex justify-center items-center py-20">
        <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-2 text-gray-600">Chargement des notifications...</span>
      </div>
      
      <!-- Empty state -->
      <div *ngIf="!loading && filteredNotifications.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        <h2 class="text-xl font-semibold mb-2">Aucune notification</h2>
        <p class="text-gray-500">Vous n'avez actuellement aucune notification à afficher.</p>
      </div>
      
      <!-- Notifications list -->
      <div *ngIf="!loading && filteredNotifications.length > 0" class="space-y-4">
        <div 
          *ngFor="let notification of filteredNotifications"
          class="bg-white rounded-lg shadow p-4 hover:shadow-md transition"
          [ngClass]="{'border-l-4 border-blue-500': !notification.readAt}"
        >
          <div class="flex items-start">
            <!-- Icon based on notification type -->
            <div [ngClass]="getNotificationIconClasses(notification.type)" class="rounded-full p-2 mr-4 flex-shrink-0">
              <svg *ngIf="notification.type === 'info'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <svg *ngIf="notification.type === 'warning'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <svg *ngIf="notification.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <svg *ngIf="notification.type === 'error'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            
            <!-- Content -->
            <div class="flex-grow">
              <div class="flex justify-between items-start mb-1">
                <h3 class="font-semibold" [ngClass]="{'font-bold': !notification.readAt}">
                  {{ notification.title }}
                </h3>
                <div class="text-sm text-gray-500">
                  {{ notification.createdAt | date:'dd/MM/yyyy HH:mm' }}
                </div>
              </div>
              
              <p class="text-gray-600 mb-2">
                {{ notification.message }}
              </p>
              
              <div class="flex justify-between items-center mt-2">
                <a 
                  *ngIf="notification.link"
                  [routerLink]="notification.link"
                  class="text-blue-600 text-sm hover:underline">
                  Voir les détails
                </a>
                
                <div class="flex space-x-2">
                  <button 
                    *ngIf="!notification.readAt"
                    (click)="markAsRead(notification)"
                    class="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Marquer comme lu
                  </button>
                  <button 
                    (click)="deleteNotification(notification)"
                    class="text-sm text-red-500 hover:text-red-700 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Supprimer
                  </button>
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
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  activeFilter: 'all' | 'unread' | 'info' | 'warning' = 'all';
  loading = true;
  unreadCount = 0;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
    this.notificationService.unreadCount$.subscribe(
      count => this.unreadCount = count
    );
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe(
      notifications => {
        this.notifications = notifications;
        this.applyFilter();
        this.loading = false;
      },
      error => {
        this.toastService.showError('Erreur lors du chargement des notifications');
        this.loading = false;
      }
    );
  }

  filterNotifications(filter: 'all' | 'unread' | 'info' | 'warning'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.activeFilter) {
      case 'unread':
        this.filteredNotifications = this.notifications.filter(n => !n.readAt);
        break;
      case 'info':
        this.filteredNotifications = this.notifications.filter(n => n.type === 'info');
        break;
      case 'warning':
        this.filteredNotifications = this.notifications.filter(n => n.type === 'warning');
        break;
      default:
        this.filteredNotifications = [...this.notifications];
        break;
    }
    
    // Tri par date (plus récent en premier)
    this.filteredNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id).subscribe(
      updatedNotification => {
        // Mettre à jour la notification localement
        const index = this.notifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          this.notifications[index].readAt = new Date();
          this.applyFilter();
        }
      },
      error => {
        this.toastService.showError('Erreur lors de la mise à jour de la notification');
      }
    );
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(
      () => {
        // Marquer toutes les notifications comme lues localement
        this.notifications.forEach(n => {
          if (!n.readAt) {
            n.readAt = new Date();
          }
        });
        this.applyFilter();
        this.toastService.showSuccess('Toutes les notifications ont été marquées comme lues');
      },
      error => {
        this.toastService.showError('Erreur lors de la mise à jour des notifications');
      }
    );
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification.id).subscribe(
      () => {
        // Supprimer la notification localement
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        this.applyFilter();
        this.toastService.showSuccess('Notification supprimée');
      },
      error => {
        this.toastService.showError('Erreur lors de la suppression de la notification');
      }
    );
  }

  getNotificationIconClasses(type: string): string {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }
}
