import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Types de toasts disponibles
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Interface pour les toasts
export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  autoClose: boolean;
  duration: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Compteur pour les IDs
  private nextId: number = 0;
  
  // BehaviorSubject pour stocker la liste des toasts
  private toasts = new BehaviorSubject<Toast[]>([]);
  
  // Exposer les toasts comme un observable
  public toasts$ = this.toasts.asObservable();

  constructor() { }
  
  /**
   * Ajouter un nouveau toast à la liste
   */
  show(
    message: string, 
    type: ToastType = 'info', 
    autoClose: boolean = true, 
    duration: number = 5000
  ): number {
    const id = this.nextId++;
    
    const toast: Toast = {
      id,
      message,
      type,
      autoClose,
      duration,
      timestamp: new Date()
    };
    
    // Ajouter le toast à la liste
    const currentToasts = [...this.toasts.value];
    currentToasts.push(toast);
    this.toasts.next(currentToasts);
    
    // Si autoClose est activé, retirer le toast après la durée spécifiée
    if (autoClose) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
    
    return id;
  }
  
  /**
   * Retirer un toast spécifique par ID
   */
  remove(id: number): void {
    const currentToasts = this.toasts.value.filter(toast => toast.id !== id);
    this.toasts.next(currentToasts);
  }
  
  /**
   * Effacer tous les toasts
   */
  clear(): void {
    this.toasts.next([]);
  }
  
  /**
   * Raccourcis pour les types de notifications courants
   */
  success(message: string, autoClose = true, duration = 5000): number {
    return this.show(message, 'success', autoClose, duration);
  }
  
  error(message: string, autoClose = true, duration = 5000): number {
    return this.show(message, 'error', autoClose, duration);
  }
  
  warning(message: string, autoClose = true, duration = 5000): number {
    return this.show(message, 'warning', autoClose, duration);
  }
  
  info(message: string, autoClose = true, duration = 5000): number {
    return this.show(message, 'info', autoClose, duration);
  }
  
  /**
   * Alias pour les méthodes ci-dessus (pour compatibilité)
   */
  showSuccess(message: string, autoClose = true, duration = 5000): number {
    return this.success(message, autoClose, duration);
  }
  
  showError(message: string, autoClose = true, duration = 5000): number {
    return this.error(message, autoClose, duration);
  }
  
  showWarning(message: string, autoClose = true, duration = 5000): number {
    return this.warning(message, autoClose, duration);
  }
  
  showInfo(message: string, autoClose = true, duration = 5000): number {
    return this.info(message, autoClose, duration);
  }
}
