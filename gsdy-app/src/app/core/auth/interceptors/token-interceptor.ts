import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Si nous avons un token, nous l'ajoutons à toutes les requêtes
    const token = this.tokenService.getToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenService.getRefreshToken();
      
      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap(response => {
            this.isRefreshing = false;
            
            // Stocker le nouveau token
            this.tokenService.saveToken(response.token);
            this.tokenService.saveRefreshToken(response.refreshToken);
            
            this.refreshTokenSubject.next(response.token);
            
            // Reprendre la requête originale avec le nouveau token
            return next.handle(this.addToken(request, response.token));
          }),
          catchError(error => {
            this.isRefreshing = false;
            
            // Si le refresh token est invalide, déconnecter l'utilisateur
            this.tokenService.clearTokens();
            this.router.navigate(['/login']);
            
            return throwError(() => error);
          })
        );
      } else {
        // Pas de refresh token, déconnexion
        this.tokenService.clearTokens();
        this.router.navigate(['/login']);
        return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
      }
    } else {
      // Attendre que le token soit rafraîchi
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}
