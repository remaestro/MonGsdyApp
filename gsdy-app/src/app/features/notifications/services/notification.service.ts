import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: Date;
  readAt?: Date;
  link?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  unreadCount$ = this.unreadCountSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.loadUnreadCount();
  }
  
  // Charger le nombre de notifications non lues
  private loadUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`)
      .subscribe(
        response => this.unreadCountSubject.next(response.count),
        error => console.error('Erreur lors du chargement du compteur de notifications', error)
      );
  }

  // Méthode publique pour déclencher le chargement si nécessaire depuis l'extérieur
  public refreshUnreadCount(): void {
    this.loadUnreadCount();
  }
  
  // Récupérer toutes les notifications
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }
  
  // Récupérer les notifications non lues
  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }
  
  // Marquer une notification comme lue
  markAsRead(id: string): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        // Mettre à jour le compteur
        const currentCount = this.unreadCountSubject.value;
        if (currentCount > 0) {
          this.unreadCountSubject.next(currentCount - 1);
        }
      })
    );
  }
  
  // Marquer toutes les notifications comme lues
  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        // Réinitialiser le compteur
        this.unreadCountSubject.next(0);
      })
    );
  }
  
  // Supprimer une notification
  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Mettre à jour le compteur si la notification était non lue
        this.getNotifications().pipe(
          map(notifications => {
            const unreadCount = notifications.filter(n => !n.readAt).length;
            this.unreadCountSubject.next(unreadCount);
          })
        ).subscribe();
      })
    );
  }
  
  // Récupérer le nombre de notifications non lues
  getUnreadCount(): Observable<number> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).pipe(
      map(response => response.count),
      tap(count => this.unreadCountSubject.next(count))
    );
  }
}
