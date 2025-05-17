export interface AdminAlert {
  id: string;
  type: 'payment' | 'support' | 'technical' | 'threshold' | 'info';
  message: string;
  priority: 'high' | 'medium' | 'low';
  date: Date;
  actionLink?: string;
  actionLabel?: string;
}
