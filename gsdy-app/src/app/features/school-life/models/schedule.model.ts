// src/app/features/school-life/models/schedule.model.ts
export interface ScheduleEntry {
  id: string;
  startTime: string; // Format HH:mm
  endTime: string;   // Format HH:mm
  dayOfWeek: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';
  subject: string;
  teacher?: string;
  room?: string;
  color?: string; // Pour l'affichage dans le calendrier
}

export interface Schedule {
  id: string;
  childId: string;
  schoolYear: string; // e.g., "2024-2025"
  entries: ScheduleEntry[];
  // On pourrait ajouter d'autres métadonnées si nécessaire, comme la date de dernière mise à jour, etc.
}
