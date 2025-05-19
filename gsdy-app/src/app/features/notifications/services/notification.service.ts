import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Notification } from '../models/notification.model'; // Importation corrigée

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]); // Pour stocker et émettre la liste des notifications
  private unreadCountSubject = new BehaviorSubject<number>(0);

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialNotifications(); // Charger les notifications initiales
    this.refreshUnreadCount(); // Charger le compte initial au démarrage du service
  }

  private loadInitialNotifications(): void {
    this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifications => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCountFromList(notifications);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des notifications initiales', error);
        this.notificationsSubject.next([]); // Émettre un tableau vide en cas d'erreur
        this.unreadCountSubject.next(0); // Réinitialiser le compteur
        return of([]);
      })
    ).subscribe();
  }

  private updateUnreadCountFromList(notifications: Notification[]): void {
    const count = notifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(count);
  }

  public refreshUnreadCount(): void {
    // Cette méthode peut maintenant s'appuyer sur la liste chargée ou appeler une API spécifique si nécessaire
    // Pour l'instant, elle recalcule à partir de la liste existante, ou recharge si la liste est vide.
    if (this.notificationsSubject.value.length > 0) {
        this.updateUnreadCountFromList(this.notificationsSubject.value);
    } else {
        // Si la liste est vide, tenter de la recharger, ce qui mettra aussi à jour le compteur
        // Alternativement, appeler un endpoint spécifique pour le compteur si disponible et plus efficient
        this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).pipe(
            map(response => response.count),
            catchError(error => {
                console.error('Erreur lors du chargement du compteur de notifications non lues', error);
                return of(0);
            })
        ).subscribe(count => {
            this.unreadCountSubject.next(count);
        });
    }
  }

  getNotifications(): Observable<Notification[]> {
    // Retourne l'observable du sujet pour que les composants s'abonnent aux mises à jour
    // et déclenche un rechargement si nécessaire (par exemple, si les données sont considérées comme obsolètes)
    // Pour cet exemple, nous rechargeons toujours pour obtenir les données les plus récentes.
    this.loadInitialNotifications(); // Déclenche le rechargement
    return this.notifications$;
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.isRead))
    );
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(updatedNotification => {
        const currentNotifications = this.notificationsSubject.value;
        const index = currentNotifications.findIndex(n => n.id === id);
        if (index !== -1) {
          currentNotifications[index] = updatedNotification;
          this.notificationsSubject.next([...currentNotifications]);
          this.updateUnreadCountFromList(currentNotifications);
        }
      }),
      catchError(error => {
        console.error(`Erreur lors du marquage de la notification ${id} comme lue`, error);
        return throwError(() => error);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        const currentNotifications = this.notificationsSubject.value.map(n => ({ ...n, isRead: true, readAt: new Date() }));
        this.notificationsSubject.next(currentNotifications);
        this.unreadCountSubject.next(0);
      }),
      catchError(error => {
        console.error('Erreur lors du marquage de toutes les notifications comme lues', error);
        return throwError(() => error);
      })
    );
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentNotifications = this.notificationsSubject.value.filter(n => n.id !== id);
        this.notificationsSubject.next(currentNotifications);
        this.updateUnreadCountFromList(currentNotifications);
      }),
      catchError(error => {
        console.error(`Erreur lors de la suppression de la notification ${id}`, error);
        return throwError(() => error);
      })
    );
  }

  // Méthode pour simuler l'ajout d'une notification (utilisé pour les tests ou démo)
  addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): void {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(2, 15), // Génère un ID aléatoire
      ...notification,
      isRead: false,
      createdAt: new Date(),
    };
    const currentNotifications = [newNotification, ...this.notificationsSubject.value];
    this.notificationsSubject.next(currentNotifications);
    this.updateUnreadCountFromList(currentNotifications);
  }
}
