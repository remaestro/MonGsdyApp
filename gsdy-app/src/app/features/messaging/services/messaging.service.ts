import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Message, MessageRequest } from '../models/message.model'; // Corrected path
import { User } from '../../../core/models/user.model'; // Import User model

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private apiUrl = `${environment.apiUrl}/messages`;
  private usersApiUrl = `${environment.apiUrl}/users`; // Added for user search

  constructor(private http: HttpClient) { }

  // MOCK DATA (Remove or replace with actual API calls)
  private mockUsers: User[] = [
    { id: 'user1', name: 'Alice Martin (Parent)', role: 'parent', email: 'alice.martin@example.com' },
    { id: 'user2', name: 'Bob Durand (Enseignant)', role: 'teacher', email: 'bob.durand@example.com' },
    { id: 'user3', name: 'Charlie Dupont (Admin)', role: 'admin', email: 'charlie.dupont@example.com' },
    { id: 'user4', name: 'David Lefevre (Parent)', role: 'parent', email: 'david.lefevre@example.com' },
    { id: 'user5', name: 'Eva Simon (Enseignant)', role: 'teacher', email: 'eva.simon@example.com' },
  ];

  private mockMessages: Message[] = [
    {
      id: 'msg1',
      subject: 'Nouvelle note de service importante',
      sender: this.mockUsers[2], // Admin
      recipients: [this.mockUsers[0], this.mockUsers[1]], // Parent, Teacher
      content: 'Une nouvelle note de service concernant les sorties scolaires a été publiée. Veuillez la consulter attentivement. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      createdAt: new Date('2025-05-16T10:00:00Z'),
      readAt: null,
      priority: 'high',
      preview: 'Une nouvelle note de service concernant les sorties scolaires a été publiée...',
      link: '/parent/messaging/msg1'
    },
    {
      id: 'msg2',
      subject: 'Rappel : Réunion parents-professeurs CM1',
      sender: this.mockUsers[1], // Teacher
      recipients: [this.mockUsers[0]], // Parent
      content: 'N\'oubliez pas la réunion parents-professeurs pour la classe de CM1 demain à 18h. Nous discuterons des progrès de votre enfant et des objectifs pour le reste de l\'année. Venez nombreux!',
      createdAt: new Date('2025-05-14T09:30:00Z'),
      readAt: new Date('2025-05-15T11:00:00Z'),
      priority: 'normal',
      preview: 'N\'oubliez pas la réunion parents-professeurs pour la classe de CM1 demain...',
      link: '/parent/messaging/msg2'
    },
    {
      id: 'msg3',
      subject: 'Invitation à la fête de l\'école',
      sender: this.mockUsers[0], // Parent (e.g., from APE)
      recipients: [this.mockUsers[1], this.mockUsers[2]], // Teacher, Admin
      content: 'Vous êtes cordialement invités à la fête de l\'école qui aura lieu le Samedi 15 Juin. De nombreuses activités et surprises vous attendent. Nous comptons sur votre présence!',
      createdAt: new Date('2025-05-12T15:00:00Z'),
      readAt: null,
      priority: 'normal',
      preview: 'Vous êtes cordialement invités à la fête de l\'école qui aura lieu le...',
      link: '/parent/messaging/msg3'
    },
  ];
  // END MOCK DATA

  getLatestMessages(count: number): Observable<Message[]> {
    // Simule la récupération des derniers messages reçus non lus, puis lus
    // Dans une vraie application, cela serait fait côté serveur
    const unreadMessages = this.mockMessages
      .filter(m => m.recipients.some(r => r.id === 'currentUserMockId') && !m.readAt)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const readMessages = this.mockMessages
      .filter(m => m.recipients.some(r => r.id === 'currentUserMockId') && m.readAt)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const latest = [...unreadMessages, ...readMessages].slice(0, count);
    return of(JSON.parse(JSON.stringify(latest)));
  }

  // Récupérer tous les messages (reçus)
  getInboxMessages(filter?: any): Observable<Message[]> {
    // Replace with actual API call
    // Example: return this.http.get<Message[]>(`${this.apiUrl}/inbox`, { params: this.buildParams(filter) });
    let messages = this.mockMessages.filter(m => m.recipients.some(r => r.id === 'currentUserMockId')); // Mock current user
    if (filter) {
      if (filter.read === true) messages = messages.filter(m => m.readAt !== null);
      if (filter.read === false) messages = messages.filter(m => m.readAt === null);
      // Add other filters (sender, dateFrom, dateTo, priority, search)
    }
    return of(JSON.parse(JSON.stringify(messages))); // Deep copy for immutability
  }

  // Récupérer les messages envoyés
  getSentMessages(filter?: any): Observable<Message[]> {
    // Replace with actual API call
    // Example: return this.http.get<Message[]>(`${this.apiUrl}/sent`, { params: this.buildParams(filter) });
    let messages = this.mockMessages.filter(m => m.sender.id === 'currentUserMockId'); // Mock current user
     if (filter) {
      // Add filters (dateFrom, dateTo, priority, search)
    }
    return of(JSON.parse(JSON.stringify(messages))); // Deep copy
  }

  // Récupérer un message par ID
  getMessage(id: string): Observable<Message> {
    // Replace with actual API call
    // Example: return this.http.get<Message>(`${this.apiUrl}/${id}`);
    const message = this.mockMessages.find(msg => msg.id === id);
    if (message) {
      return of(JSON.parse(JSON.stringify(message))); // Deep copy
    }
    return of(message as any); // Should handle not found case better
  }

  // Marquer un message comme lu
  markAsRead(id: string): Observable<Message> {
    // Replace with actual API call
    // Example: return this.http.post<Message>(`${this.apiUrl}/${id}/read`, {});
    const message = this.mockMessages.find(msg => msg.id === id);
    if (message) {
      message.readAt = new Date();
      return of(JSON.parse(JSON.stringify(message)));
    }
    return of(message as any); // Should handle error
  }

  // Marquer un message comme non lu
  markAsUnread(id: string): Observable<Message> {
    // Replace with actual API call
    // Example: return this.http.post<Message>(`${this.apiUrl}/${id}/unread`, {});
    const message = this.mockMessages.find(msg => msg.id === id);
    if (message) {
      message.readAt = null;
      return of(JSON.parse(JSON.stringify(message)));
    }
    return of(message as any); // Should handle error
  }

  // Supprimer un message
  deleteMessage(id: string): Observable<void> {
    // Replace with actual API call
    // Example: return this.http.delete<void>(`${this.apiUrl}/${id}`);
    this.mockMessages = this.mockMessages.filter(msg => msg.id !== id);
    return of(undefined);
  }

  // Envoyer un message
  sendMessage(messageRequest: MessageRequest): Observable<Message> {
    // Replace with actual API call
    // Example: return this.http.post<Message>(`${this.apiUrl}/send`, messageRequest);
    const newMessage: Message = {
      id: `msg${this.mockMessages.length + 1}`,
      subject: messageRequest.subject,
      sender: this.mockUsers[0], // Mock sender (current user)
      recipients: messageRequest.recipients.map(userId => this.mockUsers.find(u => u.id === userId)).filter(u => u) as User[],
      content: messageRequest.content,
      createdAt: new Date(),
      readAt: null,
      priority: messageRequest.priority,
      // attachments: handle attachments if needed
    };
    this.mockMessages.push(newMessage);
    return of(JSON.parse(JSON.stringify(newMessage)));
  }

  // Télécharger une pièce jointe (placeholder)
  downloadAttachment(messageId: string, attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${messageId}/attachments/${attachmentId}`, { responseType: 'blob' });
  }

  // Récupérer le nombre de messages non lus
  getUnreadCount(): Observable<number> {
    // Replace with actual API call
    // Example: return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).pipe(map(response => response.count));
    const unreadCount = this.mockMessages.filter(m => m.recipients.some(r => r.id === 'currentUserMockId') && m.readAt === null).length;
    return of(unreadCount);
  }

  // Rechercher des destinataires (utilisateurs) pour l'autocomplete
  searchUsers(query: string): Observable<User[]> {
    // Replace with actual API call
    // Example: return this.http.get<User[]>(`${this.usersApiUrl}/search`, { params: { q: query } });
    const lowerQuery = query.toLowerCase();
    const filteredUsers = this.mockUsers.filter(user =>
      user.name.toLowerCase().includes(lowerQuery) ||
      (user.email && user.email.toLowerCase().includes(lowerQuery))
    );
    return of(JSON.parse(JSON.stringify(filteredUsers)));
  }

  // Helper to build HttpParams (if using real API)
  private buildParams(filter: any): HttpParams {
    let params = new HttpParams();
    if (filter) {
      if (filter.read !== undefined) params = params.set('read', filter.read.toString());
      if (filter.sender) params = params.set('sender', filter.sender);
      // Add other params
    }
    return params;
  }

}
