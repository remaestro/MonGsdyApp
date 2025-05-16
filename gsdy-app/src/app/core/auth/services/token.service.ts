import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_KEY = 'auth-token';
const REFRESH_TOKEN_KEY = 'auth-refresh-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private router: Router) { }
  
  /**
   * Effacer toutes les données d'authentification du localStorage
   */
  public clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  
  /**
   * Sauvegarder le token d'authentification
   */
  public saveToken(token: string): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
  }
  
  /**
   * Récupérer le token d'authentification
   */
  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
  
  /**
   * Sauvegarder le refresh token
   */
  public saveRefreshToken(token: string): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
  
  /**
   * Récupérer le refresh token
   */
  public getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  
  /**
   * Sauvegarder les données utilisateur
   */
  public saveUser(user: any): void {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  
  /**
   * Récupérer les données utilisateur
   */
  public getUser(): any {
    const user = localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }
  
  /**
   * Vérifier si l'utilisateur est connecté
   */
  public isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }
}
