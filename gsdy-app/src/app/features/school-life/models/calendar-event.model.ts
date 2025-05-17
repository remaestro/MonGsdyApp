export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  description?: string;
  type: 'event' | 'holiday' | 'meeting' | 'outing'; // Type d'événement
  color?: string; // Couleur optionnelle pour l'affichage
}
