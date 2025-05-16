# Plan d'implémentation des fonctionnalités transversales (Cross-Cutting Concerns)

## Aperçu général

Ce document présente le plan d'implémentation des fonctionnalités transversales essentielles pour l'application GSDY. Ces fonctionnalités constituent la base technique de l'application et doivent être mises en place dès les premières phases du développement.

## Chronologie d'implémentation

Voici l'ordre proposé pour l'implémentation des fonctionnalités transversales:

1. Layout global (structure de base de l'application)
2. Authentification et gestion des rôles
3. Gestion des erreurs
4. Notifications
5. Multi-langue (i18n)

## Détails d'implémentation

### 1. Layout global (Sprint 1)

**Objectif**: Créer une structure visuelle cohérente pour toute l'application, garantir une navigation fluide et une expérience utilisateur homogène sur desktop et mobile. **L'application doit être mobile-first** (priorité à l'expérience mobile, puis adaptation desktop/tablette).

**Composants à développer**:
- `LayoutComponent` : point d'entrée visuel, gère l'agencement général, l'injection du loader, et l'affichage conditionnel des éléments globaux.
- `HeaderComponent` : affiche le logo, le nom de l'app, le menu utilisateur (profil, déconnexion), la langue, et les notifications.
- `SidebarComponent` : navigation principale, liens dynamiques selon le rôle, gestion du responsive (affichage drawer sur mobile).
- `FooterComponent` : informations légales, liens utiles, version de l'app.
- `LoaderComponent` : indicateur de chargement global, affiché lors des requêtes HTTP ou changements de page.

**Exemple de modèle de données** :
- MenuItem : { label: string, icon: string, route: string, roles: string[] }

**Interactions attendues** :
- Le LayoutComponent reçoit les changements d'état utilisateur via un service central (ex : AuthService ou UserService) et adapte l'affichage du header/sidebar.
- Le LoaderComponent est piloté par le LoaderService, qui expose un Observable<boolean> pour afficher/masquer le loader.

**Scénarios d'erreur/succès** :
- Si le menu ne peut pas être chargé (ex : erreur réseau), afficher un message d'erreur dans le sidebar.
- Si l'utilisateur n'a pas de rôle, masquer les liens du menu.

**Dépendances** :
- Créer LoaderService avant LoaderComponent.
- Créer AuthService avant HeaderComponent et SidebarComponent.

**Critères d'acceptation/tests** :
- [x] L'affichage s'adapte parfaitement sur mobile (testé sur Chrome mobile et simulateur).
- [x] Le loader s'affiche lors de chaque navigation ou appel HTTP long.
- [x] Le menu change dynamiquement selon le rôle de l'utilisateur.
- [x] Le header affiche le nom et le rôle de l'utilisateur connecté.

---

### 2. Authentification et gestion des rôles (Sprint 1-2)

**Objectif**: Sécuriser l'accès à l'application, garantir que chaque utilisateur accède uniquement à ses ressources, et personnaliser l'expérience selon le rôle. **L'authentification doit être fluide sur mobile**.

**Composants et services à développer**:
- `LoginComponent` : formulaire de connexion, gestion des erreurs d'authentification, redirection après login.
- `AuthService` : gestion du login/logout, stockage et décodage du JWT, extraction du rôle, gestion de l'expiration du token.
- `TokenInterceptor` : ajout automatique du JWT dans les headers HTTP, gestion du rafraîchissement du token.
- `AuthGuard` : protection des routes nécessitant une authentification.
- `RoleGuard` : restriction d'accès à certaines routes selon le rôle.

**Exemples de modèles de données** :
- User : { id: string, nom: string, email: string, role: 'admin' | 'parent' | 'enseignant' }
- Token : { accessToken: string, refreshToken?: string, expiresAt: number }

**Interactions attendues** :
- AuthService expose un Observable<User|null> pour notifier les composants (Header, Sidebar) de tout changement d'état utilisateur (login/logout/changement de rôle).
- Après login, AuthService stocke le token dans LocalStorage et notifie les autres composants.
- TokenInterceptor intercepte toutes les requêtes HTTP et ajoute le JWT.

**Scénarios d'erreur/succès** :
- Succès : Après login, redirection vers la page d'accueil adaptée au rôle.
- Erreur : Si le login échoue, afficher un message d'erreur clair (ex : "Identifiants invalides").
- Token expiré : Si une requête retourne 401, déconnecter l'utilisateur et rediriger vers la page de login.

**Dépendances** :
- Créer AuthService avant AuthGuard et RoleGuard.
- Créer TokenInterceptor après AuthService.
- Créer LoginComponent après AuthService.

**Critères d'acceptation/tests** :
- [x] L'utilisateur ne peut accéder à aucune page protégée sans être authentifié.
- [x] Le menu change dynamiquement selon le rôle après login.
- [x] Le token est supprimé du LocalStorage après logout.
- [x] Les tests simulent un token expiré et vérifient la redirection automatique.
- [x] L'UI du login est ergonomique sur mobile (clavier, validation, focus).

---

### 3. Gestion des erreurs (Sprint 2)

**Objectif**: Centraliser la gestion des erreurs pour améliorer la robustesse, la traçabilité et l'expérience utilisateur. **Les messages d'erreur doivent être lisibles sur mobile**.

**Composants et services à développer**:
- `ErrorInterceptor` : capture toutes les erreurs HTTP, déclenche des notifications ou redirections.
- `ErrorHandlerService` : centralise la gestion des erreurs applicatives, journalise les erreurs critiques.
- `NotFoundComponent` : page 404, propose un lien de retour à l'accueil.
- `ServerErrorComponent` : page 500, affiche un message d'erreur générique et un bouton de rafraîchissement.

**Exemple de modèle de données** :
- AppError : { code: number, message: string, details?: any, timestamp: number }

**Interactions attendues** :
- ErrorInterceptor transmet les erreurs à ErrorHandlerService qui décide de l'action (notification, redirection, log).
- ErrorHandlerService peut envoyer les logs à un serveur distant si besoin.

**Scénarios d'erreur/succès** :
- 401/403 : déconnexion automatique et notification.
- 404 : redirection vers NotFoundComponent.
- 500 : redirection vers ServerErrorComponent.
- Succès : navigation normale sans interruption.

**Dépendances** :
- Créer ErrorHandlerService avant ErrorInterceptor.
- Créer les pages d'erreur après ErrorInterceptor.

**Critères d'acceptation/tests** :
- [x] Toute erreur HTTP est interceptée et loggée.
- [x] Les pages d'erreur sont lisibles et responsives sur mobile.
- [x] Les logs critiques sont envoyés au serveur si activé.
- [x] Les tests simulent des erreurs 401, 404, 500 et vérifient le comportement attendu.

---

### 4. Notifications (Sprint 2-3)

**Objectif**: Informer l'utilisateur de manière non intrusive sur le succès, l'échec ou l'état d'une action. **Les notifications doivent être visibles et accessibles sur mobile**.

**Composants et services à développer**:
- `ToastService` : API pour déclencher des notifications depuis n'importe quel module.
- `ToastComponent` : affichage des notifications, gestion de la pile, animations d'entrée/sortie.
- `NotificationBadgeComponent` : badge dynamique sur l'icône de notifications dans le header.

**Exemple de modèle de données** :
- Notification : { id: string, type: 'success' | 'error' | 'info' | 'warning', message: string, read: boolean, createdAt: number }

**Interactions attendues** :
- ToastService expose un Observable<Notification[]> pour que ToastComponent affiche la pile de notifications.
- NotificationBadgeComponent s'abonne au ToastService pour afficher le nombre de notifications non lues.

**Scénarios d'erreur/succès** :
- Succès : Affichage d'une notification "succès" après une action utilisateur (ex : formulaire soumis).
- Erreur : Affichage d'une notification "erreur" en cas d'échec d'une requête.
- Notification lue : Disparition automatique ou fermeture manuelle.

**Dépendances** :
- Créer ToastService avant ToastComponent et NotificationBadgeComponent.

**Critères d'acceptation/tests** :
- [ ] Les notifications sont visibles sur mobile et desktop.
- [ ] Les notifications disparaissent automatiquement après un délai.
- [ ] Le badge de notifications s'incrémente en cas de nouvelle notification non lue.
- [ ] Les tests simulent l'empilement et la suppression de notifications.

---

### 5. Multi-langue (i18n) (Sprint 3)

**Objectif**: Permettre à l'utilisateur de choisir la langue de l'interface et garantir la traduction de tous les contenus. **Le changement de langue doit être instantané et visible sur mobile**.

**Composants et services à développer**:
- `TranslationService` : gestion du changement de langue, chargement dynamique des fichiers JSON.
- `LanguageSwitcherComponent` : sélecteur de langue dans le header.

**Exemple de modèle de données** :
- Language : { code: 'fr' | 'en', label: string, flag: string }

**Interactions attendues** :
- TranslationService expose un Observable<string> pour notifier tous les composants du changement de langue.
- LanguageSwitcherComponent déclenche le changement de langue via TranslationService.

**Scénarios d'erreur/succès** :
- Succès : L'UI change de langue instantanément après sélection.
- Erreur : Si le fichier de traduction ne se charge pas, afficher un message d'erreur et rester sur la langue précédente.

**Dépendances** :
- Créer TranslationService avant LanguageSwitcherComponent.
- Créer les fichiers de traduction avant d'extraire les textes de l'UI.

**Critères d'acceptation/tests** :
- [ ] Le changement de langue est instantané sur mobile et desktop.
- [ ] Tous les textes de l'UI sont traduits.
- [ ] La préférence de langue est persistée dans le LocalStorage.
- [ ] Les tests simulent un changement de langue et la gestion d'une erreur de chargement de fichier de traduction.

## Structure des dossiers proposée

```
src/
├── app/
│   ├── core/                     # Services et fonctionnalités singleton
│   │   ├── auth/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── services/
│   │   ├── error-handling/
│   │   ├── i18n/
│   │   └── notifications/
│   ├── features/                 # Modules fonctionnels de l'application
│   │   ├── admin/
│   │   ├── parent/
│   │   ├── teacher/
│   │   └── public/
│   ├── shared/                   # Composants, directives et pipes réutilisables
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── directives/
│   │   └── pipes/
│   └── app-routing.module.ts
├── assets/
│   ├── i18n/                     # Fichiers de traduction
│   │   ├── en.json
│   │   └── fr.json
│   └── images/
└── styles/
    ├── _variables.scss
    └── _themes.scss
```

## Technologies principales

- **Angular 16+**: Framework principal
- **Tailwind CSS**: Styles et composants UI
- **NgRx** (optionnel): Gestion d'état pour les applications complexes
- **JWT**: Authentification basée sur des tokens
- **ngx-translate**: Internationalisation

## Bonnes pratiques à suivre

1. **Architecture modulaire**: Chaque fonctionnalité dans son module
2. **Lazy Loading**: Chargement des modules à la demande
3. **Test unitaires**: Couverture minimale de 70%
4. **Design mobile-first**: S'assurer que l'application est responsive
5. **Gestion de version sémantique**: Pour les releases
6. **Documentation en ligne**: Commentaires JSDoc pour les services critiques

## Estimation des efforts

| Fonctionnalité | Complexité | Jours-homme estimés |
|----------------|------------|---------------------|
| Layout global | Moyenne | 3-5 |
| Authentification | Haute | 5-8 |
| Gestion des erreurs | Moyenne | 2-4 |
| Notifications | Moyenne | 3-5 |
| Multi-langue | Moyenne | 3-6 |

**Total estimé**: 16-28 jours-homme
