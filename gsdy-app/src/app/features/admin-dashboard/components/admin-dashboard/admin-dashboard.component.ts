import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importer CommonModule
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { AdminGlobalStats, QuickLink, RecentActivity } from '../../models/admin-stats.model';
import { StudentCountByLevel, CanteenUsageStats } from '../../../admin/models/statistic-details.model';
import { AdminAlert } from '../../models/admin-alert.model';
import { SupportTicketSummary } from '../../models/support-ticket-summary.model';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  globalStats$: Observable<AdminGlobalStats> | undefined;
  quickLinks$: Observable<QuickLink[]> | undefined;
  recentActivities$: Observable<RecentActivity[]> | undefined;
  studentDistribution$: Observable<StudentCountByLevel[]> | undefined;
  canteenStats$: Observable<CanteenUsageStats> | undefined;
  alerts$: Observable<AdminAlert[]> | undefined;
  supportTicketSummary$: Observable<SupportTicketSummary> | undefined;

  // Options pour les graphiques ngx-charts
  studentDistributionChartData$: Observable<any[]> | undefined;
  canteenStatsChartData$: Observable<any[]> | undefined;

  // Options générales pour les graphiques
  view: [number, number] = [700, 300];
  legend: boolean = true;
  legendPosition: any = 'below';
  gradient: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;

  // Schéma de couleurs pour les graphiques
  colorScheme: Color = {
    name: 'cool',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // Couleurs spécifiques pour la répartition des élèves
  studentDistributionColorScheme: Color = {
    name: 'studentDist',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#64748b', '#7dd3fc', '#f87171', '#fbbf24', '#34d399', '#a78bfa']
  };

  // Couleurs spécifiques pour les stats de cantine
  canteenChartColorScheme: Color = {
    name: 'canteenStats',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#22c55e', '#ef4444', '#f97316']
  };

  cardIconMapping: { [key: string]: string } = {
    'Gérer les Étudiants': 'fas fa-users',
    'Gestion de la Cantine': 'fas fa-utensils',
    'Messagerie Globale': 'fas fa-envelope',
    'Paramètres du Système': 'fas fa-cog',
  };

  activityIconMapping: { [key: string]: string } = {
    'Nouvel utilisateur': 'fas fa-user-plus text-green-500',
    'Mise à jour du menu': 'fas fa-calendar-alt text-blue-500',
    'Message envoyé': 'fas fa-paper-plane text-purple-500',
    'Alerte système': 'fas fa-exclamation-triangle text-red-500',
  };

  constructor(private adminDashboardService: AdminDashboardService) { }

  ngOnInit(): void {
    this.globalStats$ = this.adminDashboardService.getGlobalStats();
    this.quickLinks$ = this.adminDashboardService.getQuickLinks();
    this.recentActivities$ = this.adminDashboardService.getRecentActivities();
    this.studentDistribution$ = this.adminDashboardService.getStudentDistribution();
    this.canteenStats$ = this.adminDashboardService.getCanteenStatistics();
    this.alerts$ = this.adminDashboardService.getAlerts();
    this.supportTicketSummary$ = this.adminDashboardService.getSupportTicketSummary();

    this.studentDistributionChartData$ = this.adminDashboardService.getStudentDistribution().pipe(
      map(data => data.map(item => ({ name: item.level, value: item.count })))
    );

    this.canteenStatsChartData$ = this.adminDashboardService.getCanteenStatistics().pipe(
      map(data => [
        { name: 'Inscrits Cantine', value: data.registeredForCanteen },
        { name: 'Non Inscrits', value: data.totalStudents - data.registeredForCanteen }
      ])
    );
  }

  getIconForActivity(activityType: string): string {
    return this.activityIconMapping[activityType] || 'fas fa-info-circle text-gray-500';
  }

  trackByQuickLinkId(index: number, link: QuickLink): string {
    return link.route;
  }

  trackByActivityId(index: number, activity: RecentActivity): string {
    return activity.id;
  }

  trackByStudentLevel(index: number, item: StudentCountByLevel): string {
    return item.level;
  }

  trackByAlertId(index: number, alert: AdminAlert): string {
    return alert.id;
  }

  getAlertIcon(type: AdminAlert['type']): string {
    switch (type) {
      case 'payment': return 'fas fa-credit-card';
      case 'support': return 'fas fa-life-ring';
      case 'technical': return 'fas fa-cogs';
      case 'threshold': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-bell';
    }
  }

  getAlertColor(priority: AdminAlert['priority']): string {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  }
}
