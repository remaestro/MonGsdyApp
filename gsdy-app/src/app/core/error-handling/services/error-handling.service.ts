import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// Type pour différencier les types de notifications
export type ToastType = 'success' | 'warning' | 'error' | 'info';

// Interface pour stocker les informations de notification
export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  timestamp: Date;
  autoDismiss?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  // Sujet pour les notifications toast
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  
  // Sujet pour le logging des erreurs
  private errorLogSubject = new BehaviorSubject<any[]>([]);
  
  // Identifiant unique pour les toasts
  private nextId = 0;
  
  constructor(private router: Router) { }
  
  /**
   * Afficher un toast de notification
   */
  showToast(message: string, type: ToastType = 'info', autoDismiss: boolean = true): number {
    const id = this.nextId++;
    const toast: Toast = {
      id,
      message,
      type,
      timestamp: new Date(),
      autoDismiss
    };
    
    const currentToasts = [...this.toastsSubject.value];
    currentToasts.push(toast);
    this.toastsSubject.next(currentToasts);
    
    // Auto-suppression après 5 secondes si demandé
    if (autoDismiss) {
      setTimeout(() => this.dismissToast(id), 5000);
    }
    
    return id;
  }
  
  /**
   * Fermer une notification
   */
  dismissToast(id: number): void {
    const currentToasts = this.toastsSubject.value.filter(toast => toast.id !== id);
    this.toastsSubject.next(currentToasts);
  }
  
  /**
   * Récupérer le stream des toasts pour s'y abonner
   */
  getToasts(): Observable<Toast[]> {
    return this.toastsSubject.asObservable();
  }
  
  /**
   * Gérer une erreur côté client
   */
  handleClientError(error: any): void {
    // Log de l'erreur pour l'administrateur
    const errorLog = {
      type: 'Client Error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date()
    };
    
    this.logError(errorLog);
  }
  
  /**
   * Gérer une erreur côté serveur
   */
  handleServerError(error: HttpErrorResponse): void {
    // Log de l'erreur pour l'administrateur
    const errorLog = {
      type: 'Server Error',
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error,
      timestamp: new Date()
    };
    
    this.logError(errorLog);
  }
  
  /**
   * Ajouter une erreur au log
   */
  private logError(error: any): void {
    const currentLogs = [...this.errorLogSubject.value];
    currentLogs.push(error);
    this.errorLogSubject.next(currentLogs);
    
    // En production, on pourrait envoyer l'erreur à un service de monitoring
    if (environment.production) {
      // this.sendErrorToMonitoringService(error);
      console.error('Error logged:', error);
    }
  }
  
  /**
   * Récupérer le log des erreurs
   */
  getErrorLogs(): Observable<any[]> {
    return this.errorLogSubject.asObservable();
  }
}
