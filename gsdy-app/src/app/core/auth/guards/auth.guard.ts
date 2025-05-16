import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private tokenService: TokenService, private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.tokenService.isLoggedIn()) {
      return true;
    }
    
    // Rediriger vers la page de login si l'utilisateur n'est pas connecté
    return this.router.createUrlTree(['/login'], {
      queryParams: {
        returnUrl: state.url
      }
    });
  }
}

// Pour la compatibilité avec la nouvelle API de garde Angular
export const authGuard: CanActivateFn = (route, state) => {
  return inject(AuthGuard).canActivate(route, state);
};
