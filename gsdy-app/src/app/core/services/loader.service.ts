import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loaderSubject = new BehaviorSubject<boolean>(false);
  
  constructor() { }
  
  /**
   * Obtenir un Observable pour l'état du loader
   * @returns Observable<boolean>
   */
  getLoaderState(): Observable<boolean> {
    return this.loaderSubject.asObservable();
  }
  
  /**
   * Afficher le loader
   */
  show(): void {
    this.loaderSubject.next(true);
  }
  
  /**
   * Masquer le loader
   */
  hide(): void {
    this.loaderSubject.next(false);
  }
}
