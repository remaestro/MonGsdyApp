import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Message, Attachment, MessagePriority } from '../models/message.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/services/auth.service';
import { User } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private apiUrl = `${environment.apiUrl}/messages`;
  private messageStatusChanged = new Subject<{ messageId: string; newStatus: string }>();

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Observable for components to subscribe to message status changes
  get messageStatusChanged$(): Observable<{ messageId: string; newStatus: string }> {
    return this.messageStatusChanged.asObservable();
  }

  // Call this method when a message status changes (e.g., read, unread, deleted)
  notifyMessageStatusChange(messageId: string, newStatus: string): void {
    this.messageStatusChanged.next({ messageId, newStatus });
  }

  private getCurrentUserId(): string | null {
    const user = this.authService.getCurrentUserSync();
    return user ? user.id.toString() : null;
  }

  private getCurrentUserDetails(): { id: string; name: string; role: string } | null {
    const user = this.authService.getCurrentUserSync();
    if (!user) return null;
    const role = user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : 'parent');
    return {
      id: user.id.toString(),
      name: user.name || 'Utilisateur inconnu',
      role: role
    };
  }

  getInboxMessages(): Observable<Message[]> {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return of([]);
    return this.http.get<Message[]>(`${this.apiUrl}?recipientId=${currentUserId}`).pipe(
      map(messages => messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
      catchError(error => {
        console.error('Erreur lors de la récupération des messages de la boîte de réception', error);
        return of([]);
      })
    );
  }

  getSentMessages(userId: string): Observable<Message[]> {
    if (!userId) return of([]);
    return this.http.get<Message[]>(`${this.apiUrl}?senderId=${userId}`).pipe(
      map(messages => messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
      catchError(error => {
        console.error('Erreur lors de la récupération des messages envoyés', error);
        return of([]);
      })
    );
  }

  getMessageById(messageId: string): Observable<Message | undefined> {
    return this.http.get<Message>(`${this.apiUrl}/${messageId}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération du message ${messageId}`, error);
        return of(undefined);
      })
    );
  }

  // Updated sendMessage to handle FormData for attachments
  sendMessage(messageData: { 
    subject: string; 
    content: string; 
    recipients: { id: string; name: string; role: User['role'] }[]; 
    priority?: MessagePriority; 
    replyToId?: string | null; 
  }, attachments?: File[]): Observable<Message> {
    const currentUserDetails = this.getCurrentUserDetails();
    if (!currentUserDetails) {
      return throwError(() => new Error('Utilisateur non authentifié.'));
    }

    const formData = new FormData();
    formData.append('subject', messageData.subject);
    formData.append('content', messageData.content);
    formData.append('recipients', JSON.stringify(messageData.recipients.map(r => r.id))); // Send recipient IDs
    formData.append('priority', messageData.priority || 'normal');
    formData.append('senderId', currentUserDetails.id);
    if (messageData.replyToId) {
      formData.append('parentId', messageData.replyToId);
    }

    if (attachments && attachments.length > 0) {
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file, file.name);
      });
    }

    return this.http.post<Message>(this.apiUrl, formData).pipe(
      catchError(error => {
        console.error("Erreur lors de l'envoi du message", error);
        return throwError(() => error);
      })
    );
  }

  markAsRead(messageId: string): Observable<boolean> {
    return this.http.patch<{ success: boolean } | Message>(`${this.apiUrl}/${messageId}/read`, {}).pipe(
      map(response => {
        if (typeof (response as any).success === 'boolean') {
          return (response as { success: boolean }).success;
        } else if (response && (response as Message).id === messageId) {
          return true;
        }
        return false;
      }),
      tap(success => {
        if (success) {
          this.notifyMessageStatusChange(messageId, 'read');
        }
      }),
      catchError(error => {
        console.error(`Erreur lors du marquage du message ${messageId} comme lu`, error);
        return of(false);
      })
    );
  }

  markAsUnread(messageId: string): Observable<boolean> {
    return this.http.patch<{ success: boolean } | Message>(`${this.apiUrl}/${messageId}/unread`, {}).pipe(
      map(response => {
        if (typeof (response as any).success === 'boolean') {
          return (response as { success: boolean }).success;
        } else if (response && (response as Message).id === messageId) {
          return true;
        }
        return false;
      }),
      tap(success => {
        if (success) {
          this.notifyMessageStatusChange(messageId, 'unread');
        }
      }),
      catchError(error => {
        console.error(`Erreur lors du marquage du message ${messageId} comme non lu`, error);
        return of(false);
      })
    );
  }

  deleteMessage(messageId: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${messageId}`).pipe(
      map(() => true),
      tap(success => {
        if (success) {
          this.notifyMessageStatusChange(messageId, 'deleted');
        }
      }),
      catchError(error => {
        console.error(`Erreur lors de la suppression du message ${messageId}`, error);
        return of(false);
      })
    );
  }

  getUnreadCount(userId: string): Observable<number> {
    if (!userId) return of(0);
    return this.http.get<number>(`${this.apiUrl}/unread-count?userId=${userId}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération du nombre de messages non lus', error);
        return of(0);
      })
    );
  }

  getPotentialRecipients(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users/contacts`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des destinataires potentiels', error);
        const fallbackUsers: User[] = [
          { id: 'teacher_fallback', name: 'Enseignant Fallback', email: 'teacher@example.com', role: 'teacher' },
          { id: 'admin_fallback', name: 'Administration Fallback', email: 'admin@example.com', role: 'admin' }
        ];
        return of(fallbackUsers);
      })
    );
  }

  // Added getUserById method
  getUserById(userId: string): Observable<User | undefined> {
    return this.getPotentialRecipients().pipe(
      map(users => users.find(user => user.id === userId))
    );
  }
}
