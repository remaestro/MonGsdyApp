export interface Meal {
  id: string;
  name: string;
  description?: string;
  allergens?: string[];
}

export interface DailyMenu {
  date: Date;
  starter: Meal | null;
  mainCourse: Meal;
  dessert: Meal | null;
  notes?: string; // e.g., "Repas végétarien disponible sur demande"
}

export interface WeeklyMenu {
  weekNumber: number; // ISO week number
  year: number;
  menus: DailyMenu[]; // Généralement 4 ou 5 jours
}
