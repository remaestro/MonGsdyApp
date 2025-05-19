import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { TokenService } from 'src/app/core/auth/services/token.service';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/core/i18n/services/translation.service';
import { ToastService } from 'src/app/core/notifications/services/toast.service';
import { Subscription, Observable, of } from 'rxjs';
import { NotificationService } from 'src/app/features/notifications/services/notification.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  username: string = '';
  profileMenuOpen = false;
  userRoles: string[] = [];
  unreadNotificationsCount$: Observable<number> = of(0);

  private authSubscription: Subscription | null = null;
  private langSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private translationService: TranslationService,
    private toastService: ToastService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements d'état de connexion
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.username = user.username;
        this.userRoles = user.roles || [];
      }
    });

    // S'abonner aux changements de langue
    this.langSubscription = this.translationService.currentLanguage$.subscribe(lang => {
      // On peut utiliser cette information si besoin
      console.log('Langue changée:', lang);
    });

    // Vérifier si l'utilisateur est déjà connecté au chargement du composant
    const user = this.tokenService.getUser();
    if (user) {
      this.isLoggedIn = true;
      this.username = user.username;
      this.userRoles = user.roles || [];
    }

    // Récupérer le nombre de notifications non lues via l'observable public du service
    this.unreadNotificationsCount$ = this.notificationService.unreadCount$;

    // S'assurer que le compteur est chargé initialement ou rafraîchi
    this.notificationService.refreshUnreadCount();
  }

  ngOnDestroy(): void {
    // Nettoyage pour éviter les fuites de mémoire
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.profileMenuOpen = false;
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }
}
