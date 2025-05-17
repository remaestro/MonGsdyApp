export interface CanteenSubscription {
  id: string;
  childId: string;
  startDate: Date;
  endDate: Date | null; // Null si l'abonnement est toujours actif
  type: 'full_week' | 'specific_days'; // e.g., Lundi, Mardi, Jeudi, Vendredi
  specificDays?: string[]; // ['monday', 'tuesday', 'thursday', 'friday'] si type est specific_days
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
