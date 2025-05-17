import { Component, OnInit, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardService } from '../../services/dashboard.service';
import { WeeklySchedule, ScheduleItem } from '../../models/schedule.model';

@Component({
  selector: 'app-weekly-planning',
  templateUrl: './weekly-planning.component.html',
  styleUrls: ['./weekly-planning.component.css']
})
export class WeeklyPlanningComponent implements OnInit {
  @Input() childId: string = 'defaultChild'; // Exemple d'ID d'enfant, à remplacer par une vraie valeur

  weeklySchedule$: Observable<WeeklySchedule | null> | undefined;
  daysOfWeek: ScheduleItem['day'][] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  currentWeekStartDate: Date = new Date(); // Initialise à aujourd'hui

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.currentWeekStartDate = this.getStartOfWeek(new Date());
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.weeklySchedule$ = this.dashboardService.getWeeklySchedule(this.childId, this.currentWeekStartDate)
      .pipe(
        map(schedule => {
          if (!schedule || !schedule.schedule) return null;
          // Optionnel: Trier les activités par heure si ce n'est pas déjà fait par le service
          schedule.schedule.sort((a, b) => this.compareTime(a.time, b.time));
          return schedule;
        })
      );
  }

  getActivitiesForDay(schedule: ScheduleItem[] | undefined, day: ScheduleItem['day']): ScheduleItem[] {
    if (!schedule) return [];
    return schedule.filter(item => item.day === day);
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour que Lundi soit le premier jour
    return new Date(d.setDate(diff));
  }

  previousWeek(): void {
    this.currentWeekStartDate.setDate(this.currentWeekStartDate.getDate() - 7);
    this.currentWeekStartDate = new Date(this.currentWeekStartDate); // Crée une nouvelle instance pour la détection de changement
    this.loadSchedule();
  }

  nextWeek(): void {
    this.currentWeekStartDate.setDate(this.currentWeekStartDate.getDate() + 7);
    this.currentWeekStartDate = new Date(this.currentWeekStartDate); // Crée une nouvelle instance
    this.loadSchedule();
  }

  // Fonction simple pour comparer les heures (ex: "09:00 - 10:00")
  // Pour une comparaison plus robuste, envisagez d'utiliser une bibliothèque de dates/heures
  private compareTime(timeA: string, timeB: string): number {
    const startTimeA = timeA.split('-')[0].trim();
    const startTimeB = timeB.split('-')[0].trim();
    return startTimeA.localeCompare(startTimeB);
  }

  trackByScheduleItem(index: number, item: ScheduleItem): string {
    return item.id;
  }
}
