import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Vérifie d'abord si l'utilisateur est connecté
    if (!this.tokenService.isLoggedIn()) {
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }
    
    // Vérifie ensuite si l'utilisateur a le rôle requis
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = this.authService.getUserRoles();
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        // Rediriger vers une page d'accès refusé ou la page d'accueil
        return this.router.createUrlTree(['/access-denied']);
      }
    }
    
    return true;
  }
}

// Pour la compatibilité avec la nouvelle API de garde Angular
export const roleGuard: CanActivateFn = (route, state) => {
  return inject(RoleGuard).canActivate(route, state);
};
