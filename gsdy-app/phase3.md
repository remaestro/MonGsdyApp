# Phase 3 - Fonctionnalités élèves et cantine

## Objectifs principaux

L'objectif de la Phase 3 est de développer les fonctionnalités essentielles pour les parents concernant la gestion de leurs enfants, le suivi de la vie scolaire et la gestion de la cantine.

## Fonctionnalités détaillées

### 1. Gestion des élèves (pour les parents)

-   **Description**: Permettre aux parents de consulter et de gérer les informations de base de leurs enfants inscrits.
-   **Composants**:
    -   `ChildListComponent`: Liste les enfants associés au compte parent.
    -   `ChildProfileComponent`: Affiche le profil détaillé d'un enfant sélectionné (informations personnelles, classe, etc.).
    -   `ChildSelectorComponent`: Un composant (potentiellement dans la barre de navigation ou un menu déroulant) pour basculer facilement l'affichage des informations entre les différents enfants du parent.
-   **Services**:
    -   `ChildrenService`: Gère la récupération et la mise à jour des données des enfants.
-   **Routes**:
    -   `/parent/children`: Affiche la liste des enfants.
    -   `/parent/children/:id`: Affiche le profil de l'enfant avec l'identifiant `:id`.
-   **Modèles de données**:
    ```typescript
    interface Child {
      id: string;
      firstName: string;
      lastName: string;
      class: string; // Ex: "CP A", "CM2 B"
      birthDate: Date;
      photo?: string; // URL vers la photo de l'enfant
      // Autres informations pertinentes: allergies, personne à contacter en cas d'urgence, etc.
    }
    ```
-   **Description technique**:
    -   Interface utilisateur claire pour naviguer entre les profils de plusieurs enfants.
    -   Affichage des informations clés de chaque enfant.
    -   Le service `ChildrenService` pourrait stocker l'enfant actuellement sélectionné (l'enfant "actif") pour que les autres modules (Vie scolaire, Cantine) puissent afficher les données contextuelles. Ce choix pourrait être persisté dans le `localStorage`.

### 2. Vie scolaire (par enfant)

-   **Description**: Fournir aux parents un accès aux informations relatives à la scolarité de leur enfant sélectionné.
-   **Composants**:
    -   `CalendarComponent`: Affiche l'emploi du temps de l'enfant, les événements scolaires (sorties, réunions), les vacances.
    -   `HomeworkListComponent`: Liste les devoirs à faire, avec possibilité de filtrer par matière et par date.
    -   `ReportCardComponent`: Permet de visualiser les bulletins de notes (par trimestre/semestre).
-   **Services**:
    -   `SchoolLifeService`: Service principal pour agréger les données de la vie scolaire.
    -   `HomeworkService`: Gère la récupération des devoirs.
    -   `GradesService`: Gère la récupération des notes et bulletins.
-   **Routes**:
    -   `/parent/school-life/:childId`: Page principale de la vie scolaire pour l'enfant `:childId`. Pourrait avoir des sous-onglets ou sections pour calendrier, devoirs, notes.
-   **Description technique**:
    -   Calendrier interactif avec vues hebdomadaire et mensuelle.
    -   Système de filtres pour la liste des devoirs.
    -   Affichage clair et compréhensible des bulletins de notes.
    -   Fonctionnalité d'export des bulletins au format PDF.

### 3. Cantine (par enfant)

-   **Description**: Permettre aux parents de consulter les menus de la cantine, d'inscrire ou de désinscrire leur enfant, et de signaler des spécificités alimentaires.
-   **Composants**:
    -   `CanteenMenuComponent`: Affiche les menus de la cantine par semaine, avec détails des plats.
    -   `CanteenSubscriptionComponent`: Interface pour gérer les jours de présence de l'enfant à la cantine (inscription/désinscription).
    -   `MealDetailsComponent`: (Optionnel, pourrait être un modal) Affiche les détails d'un repas spécifique, y compris les allergènes et informations nutritionnelles si disponibles.
-   **Services**:
    -   `CanteenService`: Gère la récupération des menus, la gestion des inscriptions, et les informations spécifiques (allergies, régimes).
-   **Routes**:
    -   `/parent/canteen/:childId`: Page principale de la cantine pour l'enfant `:childId`. Pourrait avoir des sous-onglets pour les menus et l'inscription.
-   **Modèles de données**:
    ```typescript
    interface CanteenSubscription {
      childId: string;
      subscribedDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday')[]; // Jours de la semaine où l'enfant est inscrit
      specialDiet?: string; // Ex: "Végétarien", "Sans porc"
      allergies?: string[]; // Liste des allergies connues
    }

    interface MealMenu {
      date: Date;
      courses: { // Structure pour détailler entrée, plat, dessert
          starter?: string;
          mainCourse: string;
          sideDish?: string;
          dessert: string;
          bread?: boolean; // Pain inclus
          water?: boolean; // Eau incluse
      }[];
      allergens?: string[]; // Liste des allergènes présents dans le menu du jour
      nutritionalInfo?: { // Informations nutritionnelles pour le menu global du jour
        calories?: number;
        proteins?: number; // en grammes
        carbohydrates?: number; // en grammes
        fats?: number; // en grammes
      };
    }
    ```
-   **Description technique**:
    -   Affichage clair des menus hebdomadaires.
    -   Possibilité de filtrer les menus par allergènes (si l'information est disponible).
    -   Interface d'inscription/désinscription intuitive, potentiellement via un calendrier.
    -   Prise en compte et affichage des régimes alimentaires spéciaux ou allergies signalées pour l'enfant.

## Critères d'acceptation pour la Phase 3

-   Un parent peut voir la liste de ses enfants et sélectionner l'un d'eux.
-   Pour un enfant sélectionné, le parent peut consulter ses informations de profil.
-   Pour un enfant sélectionné, le parent peut consulter son emploi du temps et ses devoirs.
-   Pour un enfant sélectionné, le parent peut consulter ses bulletins de notes et les exporter en PDF.
-   Pour un enfant sélectionné, le parent peut consulter les menus de la cantine.
-   Pour un enfant sélectionné, le parent peut l'inscrire ou le désinscrire de la cantine pour des jours spécifiques.
-   Les informations sur les allergies et régimes spéciaux sont prises en compte pour la cantine.
-   L'interface est responsive et facile à utiliser sur mobile et ordinateur.
