import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators'; // Ajout de l'import pour delay
import { AdminGlobalStats, QuickLink, RecentActivity } from '../models/admin-stats.model';
import { StatisticsService } from '../../admin/services/statistics.service'; // Importer StatisticsService
import { StudentCountByLevel, CanteenUsageStats } from '../../admin/models/statistic-details.model'; // Importer les nouveaux modèles
import { map } from 'rxjs/operators'; // Importer map pour combiner des observables si nécessaire
import { AdminAlert } from '../models/admin-alert.model';
import { SupportTicketSummary } from '../models/support-ticket-summary.model'; // Import new model

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  constructor(private statisticsService: StatisticsService) { } // Injecter StatisticsService

  getGlobalStats(): Observable<AdminGlobalStats> {
    // Utiliser statisticsService pour enrichir les données si nécessaire
    // Par exemple, si totalStudents vient de StatisticsService:
    // return this.statisticsService.getStudentCountByLevel().pipe(
    //   map(studentCounts => {
    //     const totalStudents = studentCounts.reduce((sum, item) => sum + item.count, 0);
    //     return {
    //       totalStudents: totalStudents,
    //       activeTeachers: 35, // Valeur fictive
    //       unreadMessages: 12, // Valeur fictive
    //       upcomingEventsCount: 3, // Valeur fictive
    //       systemStatus: 'Opérationnel',
    //       averageAttendance: 92.5
    //     };
    //   })
    // );

    // Pour l'instant, gardons les données fictives simples comme avant
    // mais vous pouvez voir comment vous pourriez commencer à intégrer StatisticsService.
    const mockStats: AdminGlobalStats = {
      totalStudents: 452,
      activeTeachers: 35,
      unreadMessages: 12,
      upcomingEventsCount: 3,
      systemStatus: 'Opérationnel',
      averageAttendance: 92.5 // en pourcentage
    };
    return of(mockStats);
  }

  getStudentDistribution(): Observable<StudentCountByLevel[]> {
    return this.statisticsService.getStudentCountByLevel();
  }

  getCanteenStatistics(): Observable<CanteenUsageStats> {
    return this.statisticsService.getCanteenUsageStats();
  }

  getQuickLinks(): Observable<QuickLink[]> {
    const mockLinks: QuickLink[] = [
      { label: 'Gérer les Étudiants', icon: 'users', route: '/admin/students' },
      { label: 'Gestion de la Cantine', icon: 'utensils', route: '/admin/canteen' },
      { label: 'Messagerie Globale', icon: 'envelope', route: '/admin/messaging' },
      { label: 'Paramètres du Système', icon: 'cog', route: '/admin/settings' }
    ];
    return of(mockLinks);
  }

  getRecentActivities(): Observable<RecentActivity[]> {
    const mockActivities: RecentActivity[] = [
      {
        id: 'act1',
        type: 'Nouvel utilisateur',
        description: 'L\'utilisateur Dupont a été ajouté.',
        timestamp: new Date(Date.now() - 3600000) // il y a 1 heure
      },
      {
        id: 'act2',
        type: 'Mise à jour du menu',
        description: 'Le menu de la cantine pour la semaine prochaine a été mis à jour.',
        timestamp: new Date(Date.now() - 7200000) // il y a 2 heures
      },
      {
        id: 'act3',
        type: 'Message envoyé',
        description: 'Un message global a été envoyé aux parents de CM2.',
        timestamp: new Date(Date.now() - 10800000) // il y a 3 heures
      }
    ];
    return of(mockActivities.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }

  getAlerts(): Observable<AdminAlert[]> {
    const alerts: AdminAlert[] = [
      {
        id: 'alert1',
        type: 'payment',
        message: '3 paiements importants sont en retard de plus de 15 jours.',
        priority: 'high',
        date: new Date('2025-05-15T10:00:00Z'),
        actionLink: '/admin/payments/overdue',
        actionLabel: 'Voir les paiements'
      },
      {
        id: 'alert2',
        type: 'support',
        message: 'Nouvelle demande de support urgente de la part d\'un parent.',
        priority: 'high',
        date: new Date('2025-05-17T08:30:00Z'),
        actionLink: '/admin/support/tickets/new',
        actionLabel: 'Traiter la demande'
      },
      {
        id: 'alert3',
        type: 'threshold',
        message: 'Moins de 10 places restantes pour l\'activité "Camp d\'été".',
        priority: 'medium',
        date: new Date('2025-05-16T14:00:00Z'),
        actionLink: '/admin/activities/camp-ete/registrations',
        actionLabel: 'Gérer les inscriptions'
      },
      {
        id: 'alert4',
        type: 'info',
        message: 'La maintenance du système est prévue pour le 20 mai à 23h00.',
        priority: 'low',
        date: new Date('2025-05-14T18:00:00Z')
      }
    ];
    return of(alerts).pipe(delay(300)); // Simule un délai réseau
  }

  // New method for Support Ticket Summary
  getSupportTicketSummary(): Observable<SupportTicketSummary> {
    const summary: SupportTicketSummary = {
      pendingTickets: 5,
      urgentTickets: 2,
      lastTicketDate: new Date('2025-05-16T11:00:00Z')
    };
    return of(summary).pipe(delay(450)); // Simulate network delay
  }

  // Placeholder for messages awaiting moderation (if applicable)
  // getMessagesAwaitingModeration(): Observable<any> { 
  //   // Logic to fetch messages awaiting moderation
  //   return of({ count: 0 }).pipe(delay(500));
  // }

  // Placeholder for recent activity registrations (if applicable)
  // getRecentActivityRegistrations(): Observable<any> {
  //   // Logic to fetch recent activity registrations
  //   return of({ count: 0, newRegistrations: [] }).pipe(delay(600));
  // }

  // D'autres méthodes pourraient inclure la récupération de données pour des graphiques spécifiques,
  // des alertes système, etc.
}
