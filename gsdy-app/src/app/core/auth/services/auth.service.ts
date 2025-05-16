import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const API_URL = 'http://localhost:8080/api/auth/'; // À remplacer par la vraie URL d'API

interface LoginResponse {
  id: number;
  username: string;
  email: string;
  roles: string[];
  token: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();
  
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {
    // Lors de l'initialisation, vérifie si un utilisateur est déjà connecté
    const user = this.tokenService.getUser();
    if (user) {
      this.userSubject.next(user);
    }
  }
  
  /**
   * Connecter un utilisateur
   */
  login(username: string, password: string): Observable<any> {
    // En environnement de développement, nous pouvons simuler une connexion réussie
    if (!environment.production) {
      // Simulation d'une réponse API pour le développement
      const mockResponse: LoginResponse = {
        id: 1,
        username: username,
        email: `${username}@example.com`,
        roles: ['user'],
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      };
      
      // Ajouter le rôle admin si le nom d'utilisateur est "admin"
      if (username === 'admin') {
        mockResponse.roles.push('admin');
      }
      
      // Stocker les informations dans le localStorage
      this.tokenService.saveToken(mockResponse.token);
      this.tokenService.saveRefreshToken(mockResponse.refreshToken);
      this.tokenService.saveUser(mockResponse);
      this.userSubject.next(mockResponse);
      
      return of(mockResponse);
    }
    
    // En production, appel API réel
    return this.http.post<LoginResponse>(
      API_URL + 'login',
      { username, password },
      this.httpOptions
    ).pipe(
      tap(response => {
        this.tokenService.saveToken(response.token);
        this.tokenService.saveRefreshToken(response.refreshToken);
        this.tokenService.saveUser(response);
        this.userSubject.next(response);
      })
    );
  }
  
  /**
   * Déconnecter l'utilisateur
   */
  logout(): void {
    // Supprimer les données d'authentification
    this.tokenService.clearTokens();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  /**
   * Rafraîchir le token d'authentification
   */
  refreshToken(refreshToken: string): Observable<RefreshTokenResponse> {
    // En environnement de développement
    if (!environment.production) {
      // Simulation d'un nouveau token
      const mockResponse: RefreshTokenResponse = {
        token: 'new-mock-jwt-token',
        refreshToken: 'new-mock-refresh-token'
      };
      
      return of(mockResponse);
    }
    
    // En production
    return this.http.post<RefreshTokenResponse>(
      API_URL + 'refresh-token',
      { refreshToken },
      this.httpOptions
    );
  }
  
  /**
   * Obtenir les rôles de l'utilisateur courant
   */
  getUserRoles(): string[] {
    const user = this.tokenService.getUser();
    return user?.roles || [];
  }
  
  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }
}
