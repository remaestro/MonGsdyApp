/**
 * Modèle représentant une activité parascolaire
 */
export interface Activity {
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

/**
 * Modèle représentant une inscription à une activité
 */
export interface ActivityRegistration {
  activityId: string;
  childId: string;
  registeredAt: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
}
