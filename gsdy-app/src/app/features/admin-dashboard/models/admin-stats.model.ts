export interface AdminGlobalStats {
  totalStudents: number;
  activeTeachers: number;
  unreadMessages: number;
  upcomingEventsCount: number;
  systemStatus?: string; // e.g., "Opérationnel", "Maintenance en cours"
  averageAttendance?: number; // Pourcentage
  // ...autres statistiques globales pertinentes
}

export interface QuickLink {
  label: string;
  icon?: string; // Nom d'icône (ex: FontAwesome)
  route: string;
}

export interface RecentActivity {
  id: string;
  type: string; // e.g., "Nouvel utilisateur", "Mise à jour du contenu", "Alerte système"
  description: string;
  timestamp: Date;
  link?: string; // Lien optionnel vers l'élément concerné
}

// Vous pouvez ajouter d'autres modèles pour des graphiques spécifiques, etc.
// export interface ChartData {
//   labels: string[];
//   datasets: {
//     label: string;
//     data: number[];
//     backgroundColor?: string | string[];
//     borderColor?: string | string[];
//     borderWidth?: number;
//   }[];
// }
