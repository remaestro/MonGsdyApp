export interface ScheduleItem {
  id: string;
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';
  time: string; // e.g., "09:00 - 10:00" or "Matin"
  activity: string;
  location?: string;
  details?: string;
  category?: 'school' | 'extracurricular' | 'canteen' | 'homework';
}

export interface WeeklySchedule {
  childId: string;
  weekStartDate: Date;
  schedule: ScheduleItem[];
}
