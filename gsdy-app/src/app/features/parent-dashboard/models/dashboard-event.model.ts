export interface DashboardEvent {
  id: string;
  title: string;
  date: Date;
  location?: string;
  description?: string;
  type?: 'event' | 'reminder' | 'alert'; // Pourrait être étendu
}
