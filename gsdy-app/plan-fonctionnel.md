# Plan Fonctionnel GSDY App

## Détails d'implémentation par phase

### Phase 1 - Authentification et base de l'application ✅

#### Page de Login
- **Composants**: `LoginComponent`
- **Services**: `AuthService`, `TokenService`
- **Routes**: `/login`
- **Modèles de données**:
  ```typescript
  interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
  }
  
  interface LoginResponse {
    token: string;
    refreshToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: 'parent' | 'admin' | 'teacher';
    }
  }
  ```
- **Description technique**:
  - Formulaire réactif avec validation (email requis, format email, mot de passe min 6 caractères)
  - Gestion des erreurs (mauvais identifiants, serveur indisponible)
  - Stockage sécurisé du token JWT et redirection

#### Page de Récupération de mot de passe
- **Composants**: `PasswordRecoveryComponent`
- **Services**: `AuthService`
- **Routes**: `/password-recovery`
- **Modèles de données**:
  ```typescript
  interface PasswordRecoveryRequest {
    email: string;
  }
  ```
- **Description technique**:
  - Formulaire simple avec validation email
  - Message de confirmation après soumission (pour éviter les attaques par énumération)

#### Redirection Post-Login
- **Services**: `AuthGuard`, `RoleGuard`
- **Description technique**:
  - Utilisation de guards pour protéger les routes selon rôle
  - Redirection intelligente en fonction du rôle de l'utilisateur (`/parent`, `/admin`, `/teacher`)

### Phase 2 - Tableaux de bord ✅

#### Dashboard Parent
- **Composants**: 
  - `ParentDashboardComponent`
  - `DashboardCardComponent` (réutilisable)
  - `WeeklyPlanningComponent`
  - `LatestMessagesComponent`
- **Services**: `DashboardService`, `MessagingService`
- **Routes**: `/parent/dashboard`
- **Modèles de données**:
  ```typescript
  interface DashboardSummary {
    balance: number;
    unreadMessages: number;
    upcomingEvents: DashboardEvent[];
    children: ChildSummary[];
  }
  ```
- **Description technique**:
  - Conception responsive avec Tailwind CSS
  - Cartes de présentation pour chaque section
  - Mini-calendrier avec les événements de la semaine

#### Dashboard Admin
- **Composants**: `AdminDashboardComponent`
- **Services**: `AdminDashboardService`, `StatisticsService`
- **Routes**: `/admin/dashboard`
- **Description technique**:
  - Vue récapitulative des métriques principales
  - Cards de statistiques et d'actions rapides
  - Alertes pour éléments nécessitant attention

### Phase 3 - Fonctionnalités élèves et cantine ✅

#### Gestion des élèves (parents)
- **Composants**: 
  - `ChildListComponent`
  - `ChildProfileComponent`
  - `ChildSelectorComponent`
- **Services**: `ChildrenService`
- **Routes**: `/parent/children`, `/parent/children/:id`
- **Modèles de données**:
  ```typescript
  interface Child {
    id: string;
    firstName: string;
    lastName: string;
    class: string;
    birthDate: Date;
    photo?: string;
  }
  ```
- **Description technique**:
  - Interface pour basculer facilement entre plusieurs enfants
  - Affichage des informations principales de l'élève
  - Stockage de l'élève actif dans service et localStorage

#### Vie scolaire (élève)
- **Composants**: 
  - `CalendarComponent`
  - `HomeworkListComponent`
  - `ReportCardComponent`
- **Services**: `SchoolLifeService`, `HomeworkService`, `GradesService`  
- **Routes**: `/parent/school-life/:childId`
- **Description technique**:
  - Calendrier flexible avec vue hebdomadaire/mensuelle
  - Liste de devoirs filtrables par matière et date
  - Visualisation des bulletins de notes par trimestre
  - Export PDF des bulletins

#### Cantine
- **Composants**: 
  - `CanteenMenuComponent`
  - `CanteenSubscriptionComponent`
  - `MealDetailsComponent`
- **Services**: `CanteenService`
- **Routes**: `/parent/canteen/:childId`
- **Modèles de données**:
  ```typescript
  interface CanteenSubscription {
    childId: string;
    subscribedDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday')[];
    specialDiet?: string;
    allergies?: string[];
  }
  
  interface MealMenu {
    date: Date;
    courses: string[];
    allergens?: string[];
    nutritionalInfo?: {
      calories: number;
      proteins: number;
      carbohydrates: number;
      fats: number;
    }
  }
  ```
- **Description technique**:
  - Affichage des menus par semaine avec filtres pour allergènes
  - Interface d'inscription avec calendrier
  - Gestion des cas particuliers (allergies, régimes spéciaux)

### Phase 4 - Paiements, Communication et Notifications ✅

#### Paiements
- **Composants**: 
  - `PaymentsComponent`
  - `InvoiceListComponent`
  - `PaymentFormComponent`
  - `PaymentHistoryComponent`
- **Services**: `PaymentService`, `InvoiceService`
- **Routes**: `/parent/payments`, `/parent/payments/invoice/:id`, `/parent/payments/history`
- **Modèles de données**:
  ```typescript
  interface Invoice {
    id: string;
    amount: number;
    description: string;
    dueDate: Date;
    status: 'pending' | 'paid' | 'overdue';
    items: InvoiceItem[];
  }
  
  interface Payment {
    id: string;
    amount: number;
    date: Date;
    method: 'creditCard' | 'bankTransfer' | 'cash' | 'other';
    status: 'processing' | 'completed' | 'failed';
    invoiceId?: string;
  }
  ```
- **Description technique**:
  - Intégration avec Stripe Elements pour paiement sécurisé
  - Gestion des états de paiement et webhooks
  - Génération de reçus téléchargeables
  - Historique des transactions filtrable

#### Communication / Messagerie
- **Composants**: 
  - `InboxComponent`
  - `MessageDetailComponent`
  - `ComposeMessageComponent`
- **Services**: `MessagingService`
- **Routes**: `/parent/messaging`, `/parent/messaging/:messageId`
- **Modèles de données**:
  ```typescript
  interface Message {
    id: string;
    subject: string;
    content: string;
    sender: {
      id: string;
      name: string;
      role: string;
    };
    recipients: string[];
    createdAt: Date;
    readAt?: Date;
    attachments?: Attachment[];
    priority?: 'normal' | 'high' | 'urgent';
  }
  ```
- **Description technique**:
  - Interface de type email
  - Support pour les pièces jointes
  - Marquage lu/non-lu
  - Filtres par expéditeur, date, etc.

#### Notifications
- **Composants**: `NotificationsListComponent`
- **Services**: `NotificationService`
- **Routes**: `/notifications`
- **Description technique**:
  - Liste des notifications système et personnelles
  - Fonctionnalité pour marquer comme lues
  - Badge de notification dans le header
  - Support pour notifications push (optionnel)

### Phase 5 - Documents et Activités ✅

#### Documents
- **Composants**: 
  - `DocumentsComponent`
  - `DocumentViewerComponent`
  - `SignatureModalComponent`
- **Services**: `DocumentService`, `SignatureService`
- **Routes**: `/parent/documents`, `/parent/documents/:documentId`
- **Modèles de données**:
  ```typescript
  interface Document {
    id: string;
    title: string;
    description?: string;
    fileUrl: string;
    fileType: 'pdf' | 'image' | 'doc' | 'other';
    createdAt: Date;
    requiresSignature: boolean;
    signedAt?: Date;
    expiresAt?: Date;
  }
  
  interface Signature {
    documentId: string;
    userId: string;
    signatureData: string;
    signedAt: Date;
    ipAddress: string;
  }
  ```
- **Description technique**:
  - Prévisualisation des documents PDF et images
  - Composant de signature électronique avec pad
  - Stockage sécurisé des signatures
  - Horodatage et journalisation des actions

#### Activités Parascolaires
- **Composants**: 
  - `ActivitiesListComponent`
  - `ActivityDetailComponent`
  - `ActivityRegistrationComponent`
- **Services**: `ActivitiesService`
- **Routes**: `/parent/activities`, `/parent/activities/:activityId`
- **Modèles de données**:
  ```typescript
  interface Activity {
    id: string;
    name: string;
    description: string;
    dayOfWeek: string[];
    timeStart: string;
    timeEnd: string;
    ageMin?: number;
    ageMax?: number;
    price: number;
    availableSpots: number;
    totalSpots: number;
    location: string;
    teacher: string;
  }
  
  interface ActivityRegistration {
    activityId: string;
    childId: string;
    registeredAt: Date;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentStatus: 'unpaid' | 'paid';
  }
  ```
- **Description technique**:
  - Filtres par jour, âge, disponibilité, etc.
  - Processus d'inscription avec vérification disponibilité
  - Intégration avec le module de paiement
  - Gestion des listes d'attente

#### Gestion profil utilisateur
- **Composants**: `UserProfileComponent`
- **Services**: `UserService`
- **Routes**: `/profile`
- **Modèles de données**:
  ```typescript
  interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: Address;
    preferences: {
      language: 'fr' | 'en';
      notificationPreferences: {
        email: boolean;
        sms: boolean;
        push: boolean;
      };
      theme?: 'light' | 'dark';
    }
  }
  ```
- **Description technique**:
  - Formulaires de modification des informations
  - Vérification de mot de passe sécurisée
  - Gestion des préférences utilisateur

### Phase 6 - Administration ✅

#### Admin - Gestion Élèves
- **Composants**: 
  - `AdminStudentsComponent`
  - `StudentFormComponent`
  - `BulkUploadComponent`
- **Services**: `AdminStudentService`
- **Routes**: `/admin/students`, `/admin/students/add`, `/admin/students/:studentId`
- **Description technique**:
  - CRUD complet avec validations
  - Upload photos élèves
  - Import/export CSV pour ajouts en masse
  - Filtres et recherche avancée

#### Admin - Gestion Cantine
- **Composants**: 
  - `AdminCanteenComponent`
  - `MenuPlannerComponent`
  - `CanteenReportComponent`
- **Services**: `AdminCanteenService`
- **Routes**: `/admin/canteen`, `/admin/canteen/menu-planner`
- **Description technique**:
  - Interface pour planification des menus
  - Gestion des régimes spéciaux
  - Rapports de fréquentation
  - Ajustements de dernière minute

#### Admin - Envoi de Communications
- **Composants**: 
  - `AdminMessagingComponent`
  - `MessageTemplateComponent`
  - `BulkMessageComponent`
- **Services**: `AdminMessagingService`
- **Routes**: `/admin/communications`
- **Description technique**:
  - Éditeur de texte riche
  - Templates de message réutilisables
  - Envoi groupé avec sélecteur de destinataires
  - Planification de messages

#### Admin - Statistiques
- **Composants**: `AdminStatsComponent`
- **Services**: `StatisticsService`
- **Routes**: `/admin/statistics`
- **Description technique**:
  - Graphiques interactifs avec chart.js ou ngx-charts
  - Filtres par période
  - Export de données et rapports
  - Tableaux de données complémentaires
  - Complexité: ⭐⭐⭐⭐ (intégration graphiques avancés et calculs)

## Structure de navigation

```
/ (racine)
├── /login
├── /password-recovery
├── /parent
│   ├── /dashboard
│   ├── /children
│   │   └── /:childId
│   ├── /school-life/:childId
│   ├── /canteen/:childId
│   ├── /payments
│   │   ├── /invoice/:id
│   │   └── /history
│   ├── /messaging
│   │   └── /:messageId
│   ├── /documents
│   │   └── /:documentId
│   └── /activities
│       └── /:activityId
├── /admin
│   ├── /dashboard
│   ├── /students
│   │   ├── /add
│   │   └── /:studentId
│   ├── /canteen
│   │   └── /menu-planner
│   ├── /communications
│   └── /statistics
├── /teacher (à développer dans une phase future)
├── /profile
└── /notifications
```

## Dépendances externes

- **Angular Material**: Composants UI
- **Tailwind CSS**: Framework CSS utilitaire
- **Chart.js / ngx-charts**: Visualisation de données
- **Stripe Elements**: Intégration paiement
- **SignaturePad**: Signatures électroniques
- **jsPDF**: Génération de PDF
- **ngx-translate**: Internationalisation
- **JWT**: Authentification par token
