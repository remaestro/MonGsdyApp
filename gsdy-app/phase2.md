### Phase 2 - Tableaux de bord ✅

#### Dashboard Parent
- **Composants**: 
  - `ParentDashboardComponent`: Ce composant principal sert de page d'accueil pour les parents après leur connexion. Il agrège les informations les plus pertinentes et les plus fréquemment consultées, offrant un aperçu rapide de la vie scolaire de leur(s) enfant(s) et des actions requises. Il doit permettre une navigation intuitive vers les sections détaillées de l'application.
  - `DashboardCardComponent` (réutilisable): Un composant générique et configurable, conçu pour afficher des blocs d'informations spécifiques de manière concise et visuellement attrayante. Chaque carte pourrait représenter un module (ex: solde de la cantine, messages non lus, prochains événements, devoirs récents). Sa réutilisabilité permettra de construire des tableaux de bord variés et cohérents à travers l'application. Les cartes pourraient avoir des indicateurs visuels (icônes, couleurs) pour attirer l'attention sur des informations importantes ou urgentes.
  - `WeeklyPlanningComponent`: Affiche un aperçu du planning hebdomadaire de l'enfant sélectionné. Cela inclut les cours, les activités parascolaires, les événements spéciaux de l'école, et potentiellement les dates de rendu des devoirs. Il devrait offrir une navigation simple pour passer d'une semaine à l'autre et mettre en évidence les événements du jour.
  - `LatestMessagesComponent`: Présente un extrait des messages les plus récents et non lus destinés au parent. Chaque extrait devrait indiquer l'expéditeur, l'objet du message et un lien pour lire le message complet dans la section messagerie. Un compteur de messages non lus pourrait également y être intégré.
- **Services**: 
  - `DashboardService`: Ce service est responsable de la collecte et de l'agrégation des données nécessaires à l'affichage du `ParentDashboardComponent`. Il interagira avec d'autres services (comme `MessagingService`, `CanteenService`, `SchoolLifeService`) pour récupérer les informations pertinentes (solde, nombre de messages non lus, événements à venir, etc.) et les formater pour le tableau de bord.
  - `MessagingService`: Utilisé par le `ParentDashboardComponent` (via le `DashboardService` ou directement par `LatestMessagesComponent`) pour récupérer le nombre de messages non lus et les aperçus des messages récents.
- **Routes**: `/parent/dashboard` - L'URL unique pour accéder au tableau de bord du parent.
- **Modèles de données**:
  ```typescript
  interface DashboardSummary {
    balance: number; // Représente le solde actuel du compte cantine ou des paiements divers.
    unreadMessages: number; // Nombre total de messages non lus.
    upcomingEvents: DashboardEvent[]; // Liste des événements prévus (réunions, sorties scolaires, etc.).
    children: ChildSummary[]; // Informations sommaires sur chaque enfant lié au compte parent.
  }
  // Note: Les interfaces DashboardEvent et ChildSummary devraient être définies ailleurs,
  // détaillant les informations spécifiques qu'elles contiennent (ex: nom de l'événement, date, nom de l'enfant, classe).
  ```
- **Description technique**:
  - **Conception responsive avec Tailwind CSS**: L'interface utilisateur du tableau de bord doit s'adapter fluidement à différentes tailles d'écran (ordinateurs de bureau, tablettes, smartphones), garantissant une expérience utilisateur optimale sur tous les appareils. Tailwind CSS sera utilisé pour faciliter la création rapide d'une interface moderne et adaptable.
  - **Cartes de présentation pour chaque section**: L'information sera organisée en cartes distinctes et thématiques (ex: "Mes Messages", "Cantine", "Événements à Venir"). Chaque carte agira comme un point d'entrée vers la section détaillée correspondante, tout en affichant les informations clés directement sur le tableau de bord. Cela améliore la lisibilité et permet aux parents d'accéder rapidement à l'information recherchée.
  - **Mini-calendrier avec les événements de la semaine**: Intégration d'un composant de calendrier compact affichant les événements importants (scolaires, parascolaires, administratifs) pour la semaine en cours. Il pourrait permettre de naviguer entre les semaines et de cliquer sur un événement pour obtenir plus de détails ou un lien vers la section concernée.

#### Dashboard Admin
- **Composants**: 
  - `AdminDashboardComponent`: Le point d'entrée principal pour les administrateurs. Ce tableau de bord fournira une vue d'ensemble de l'activité de l'école, des statistiques clés, des alertes et des raccourcis vers les fonctionnalités d'administration les plus utilisées. L'objectif est de permettre aux administrateurs de superviser efficacement l'établissement et d'identifier rapidement les points nécessitant leur attention.
- **Services**: 
  - `AdminDashboardService`: Service dédié à la collecte et à la préparation des données spécifiques au tableau de bord administrateur. Il orchestrera les appels à d'autres services (comme `StatisticsService`, `UserService`, `AdminStudentService`) pour agréger les informations nécessaires.
  - `StatisticsService`: Fournit les données statistiques brutes ou agrégées (nombre d'élèves inscrits, taux de participation à la cantine, revenus, etc.) qui seront affichées sur le tableau de bord via des graphiques ou des chiffres clés.
- **Routes**: `/admin/dashboard` - L'URL unique pour accéder au tableau de bord de l'administrateur.
- **Description technique**:
  - **Vue récapitulative des métriques principales**: Affichage clair et concis des indicateurs de performance clés (KPIs) pour l'établissement. Par exemple : nombre total d'élèves, nombre d'enseignants, taux d'absentéisme, état des inscriptions, statistiques financières de base. Ces métriques pourraient être présentées sous forme de chiffres, de jauges ou de petits graphiques.
  - **Cards de statistiques et d'actions rapides**: Utilisation de cartes pour présenter des statistiques spécifiques (ex: "Nouveaux messages en attente de modération", "Inscriptions récentes aux activités") et pour fournir des liens directs vers des actions administratives courantes (ex: "Gérer les utilisateurs", "Envoyer une communication globale", "Valider les inscriptions").
  - **Alertes pour éléments nécessitant attention**: Un système d'alertes visuelles pour signaler les problèmes urgents ou les tâches en attente. Par exemple : paiements en retard importants, demandes de support non traitées, problèmes techniques signalés, seuils critiques atteints (ex: nombre de places restantes pour une activité). Ces alertes doivent être priorisées et facilement identifiables.

### Points Restants et Améliorations pour Phase 2

Bien que les fonctionnalités de base des tableaux de bord Parent et Administrateur soient implémentées, les points suivants nécessitent une attention supplémentaire pour finaliser la Phase 2 :

**Pour le Dashboard Administrateur :**

1.  **Cartes de statistiques spécifiques et actions contextuelles supplémentaires :**
    *   **Objectif :** Fournir des aperçus rapides sur des aspects opérationnels clés et faciliter l'accès aux actions associées.
    *   **Exemples :**
        *   Créer une carte pour "Nouveaux messages en attente de modération" (si un système de modération est prévu).
        *   Créer une carte pour "Inscriptions récentes aux activités" avec un lien vers la gestion des inscriptions.
        *   Afficher le nombre de "Demandes de support en attente" avec un lien vers le système de tickets.

2.  **Amélioration de la visualisation des données :**
    *   **Objectif :** Rendre les données statistiques plus intuitives et exploitables grâce à des représentations graphiques.
    *   **Actions :**
        *   Intégrer une bibliothèque de graphiques (par exemple, Chart.js, ngx-charts ou une autre solution compatible Angular).
        *   Transformer les listes actuelles de "Répartition des Élèves par Niveau" et "Statistiques de la Cantine" en graphiques (ex: diagrammes circulaires, à barres).
        *   Envisager des graphiques pour d'autres métriques clés si pertinent (ex: évolution des inscriptions, taux de présence).

3.  **Intégration des données réelles :**
    *   **Objectif :** Assurer que les tableaux de bord reflètent l'état actuel et réel du système.
    *   **Actions :**
        *   Connecter `AdminDashboardService` et `StatisticsService` (ainsi que `DashboardService` et `MessagingService` pour le parent) à des sources de données réelles (API backend).
        *   Remplacer toutes les données fictives et les délais simulés par des appels API asynchrones.

**Améliorations Générales (Applicables aux deux Dashboards) :**

4.  **Raffinements UI/UX :**
    *   **Objectif :** Optimiser l'expérience utilisateur globale.
    *   **Actions :**
        *   Revue de la responsivité sur différentes tailles d'écran et appareils.
        *   Amélioration de la clarté des libellés, des icônes et de la hiérarchie visuelle.
        *   Optimisation des performances de chargement des données et de l'affichage des composants.
        *   Assurer la cohérence stylistique avec le reste de l'application.

5.  **Tests et Validation :**
    *   **Objectif :** Garantir la fiabilité et la robustesse des fonctionnalités des tableaux de bord.
    *   **Actions :**
        *   Mettre en place des tests unitaires pour les services et les logiques complexes des composants.
        *   Effectuer des tests d'intégration pour s'assurer que les composants interagissent correctement.
        *   Valider le comportement attendu sur différents navigateurs.
