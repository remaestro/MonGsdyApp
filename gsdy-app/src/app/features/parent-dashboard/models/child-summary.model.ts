export interface ChildSummary {
  childId: string;
  name: string;
  class: string;
  teacher: string;
  canteenRegistered: boolean;
  homeworkDue: number; // Nombre de devoirs à faire
  upcomingEvents: number; // Nombre d'événements à venir le concernant
  // Ajouter d'autres champs pertinents au besoin
}
