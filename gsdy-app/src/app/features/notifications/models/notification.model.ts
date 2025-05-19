export interface Notification {
  id: string;
  userId: string; // ID de l'utilisateur à qui la notification est destinée
  type: 'info' | 'alert' | 'event' | 'message' | 'payment' | 'document'; // Type de notification
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  icon?: string; // ex: 'fas fa-exclamation-triangle', 'fas fa-envelope', 'fas fa-file-invoice-dollar'
  link?: string; // Lien de redirection (ex: vers un message, une facture)
  data?: any; // Données supplémentaires spécifiques à la notification
}
