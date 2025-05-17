export interface SupportTicketSummary {
  pendingTickets: number;
  urgentTickets: number;
  averageResolutionTimeHours?: number; // Optional: could be added later
  lastTicketDate?: Date; // Optional: date of the latest ticket
}
