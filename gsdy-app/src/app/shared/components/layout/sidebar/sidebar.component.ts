import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { TokenService } from 'src/app/core/auth/services/token.service';

// Interface pour les éléments du menu
interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [];
  errorLoading: boolean = false;
  userRoles: string[] = [];
  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) { }

  ngOnInit(): void {
    // S'abonner aux changements d'utilisateur
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.userRoles = user.roles || [];
      } else {
        this.userRoles = [];
      }
      this.loadMenuItems();
    });

    // Vérifier si l'utilisateur est déjà connecté au chargement
    const user = this.tokenService.getUser();
    if (user) {
      this.userRoles = user.roles || [];
    }

    // Chargement initial des éléments du menu
    this.loadMenuItems();
  }

  ngOnDestroy(): void {
    // Désabonnement pour éviter les fuites de mémoire
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }

  /**
   * Vérifier si un élément du menu devrait être affiché à l'utilisateur
   */
  shouldShowMenuItem(item: MenuItem): boolean {
    // Si aucun rôle requis, montrer à tous
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    
    // Vérifier que l'utilisateur a au moins un des rôles requis
    return item.roles.some(role => this.hasRole(role));
  }

  /**
   * Charger les éléments du menu
   */
  loadMenuItems(): void {
    try {
      // Menu de base pour tous les utilisateurs
      const baseMenu: MenuItem[] = [
        {
          label: 'Accueil',
          icon: 'home',
          route: '/home'
        },
        {
          label: 'Profil',
          icon: 'users',
          route: '/profile'
        },
        {
          label: 'Paramètres',
          icon: 'settings',
          route: '/settings'
        }
      ];
      
      // Menu pour administrateurs
      const adminMenu: MenuItem[] = [
        {
          label: 'Administration',
          icon: 'admin',
          route: '/admin',
          roles: ['admin']
        }
      ];
      
      // Combiner les menus selon les rôles
      this.menuItems = [...baseMenu];
      
      if (this.hasRole('admin')) {
        this.menuItems = [...this.menuItems, ...adminMenu];
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement du menu', error);
      this.errorLoading = true;
    }
  }
}
