import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ErrorHandlingService } from '../services/error-handling.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private errorHandlingService: ErrorHandlingService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
          this.errorHandlingService.handleClientError(error.error);
        } else {
          // Erreur côté serveur
          errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
          
          // Gérer les différents types d'erreurs HTTP
          switch (error.status) {
            case 0:
              // Aucune réponse du serveur, probablement déconnecté
              this.errorHandlingService.showToast('Le serveur n\'est pas accessible. Veuillez vérifier votre connexion réseau.', 'error');
              break;
              
            case 401: // Non autorisé
              this.errorHandlingService.showToast('Session expirée. Veuillez vous reconnecter.', 'warning');
              break;
              
            case 403: // Accès refusé
              this.errorHandlingService.showToast('Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.', 'warning');
              this.router.navigate(['/access-denied']);
              break;
              
            case 404: // Page non trouvée
              this.router.navigate(['/not-found']);
              break;
              
            case 500: // Erreur serveur
              this.errorHandlingService.showToast('Une erreur interne du serveur est survenue. Veuillez réessayer plus tard.', 'error');
              this.router.navigate(['/server-error']);
              break;
              
            default:
              // Autres erreurs
              this.errorHandlingService.showToast('Une erreur est survenue. Veuillez réessayer.', 'error');
              this.errorHandlingService.handleServerError(error);
          }
        }
        
        // Log de l'erreur pour le débogage
        console.error(errorMessage);
        
        // Propagation de l'erreur
        return throwError(() => error);
      })
    );
  }
}
