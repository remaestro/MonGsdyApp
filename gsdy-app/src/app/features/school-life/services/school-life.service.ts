import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CalendarEvent } from '../models/calendar-event.model';
import { Homework } from '../models/homework.model';
import { ReportCard } from '../models/report-card.model';
import { HomeworkService } from './homework.service';
import { GradesService } from './grades.service';

// Mock data for Calendar Events (to be moved to its own service if it grows)
const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'evt1',
    title: 'Réunion Parents-Professeurs CP',
    start: new Date('2025-06-05T17:00:00'),
    end: new Date('2025-06-05T19:00:00'),
    type: 'meeting',
    color: '#facc15' // yellow-400
  },
  {
    id: 'evt2',
    title: 'Sortie scolaire - Musée d\'histoire naturelle',
    start: new Date('2025-06-12'),
    allDay: true,
    type: 'outing',
    color: '#34d399' // green-400
  },
  {
    id: 'evt3',
    title: 'Vacances de Printemps',
    start: new Date('2025-04-19'),
    end: new Date('2025-05-05'),
    allDay: true,
    type: 'holiday',
    color: '#fb923c' // orange-400
  }
];

export interface SchoolLifeData {
  calendarEvents: CalendarEvent[];
  homework: Homework[];
  reportCards: ReportCard[];
}

@Injectable({
  providedIn: 'root' // Ou dans un module spécifique
})
export class SchoolLifeService {

  constructor(
    private homeworkService: HomeworkService,
    private gradesService: GradesService
  ) { }

  getCalendarEventsForChild(childId: string): Observable<CalendarEvent[]> {
    // For now, returning all mock events, assuming they are general or would be filtered by childId in a real backend
    return of(mockCalendarEvents);
  }

  getSchoolLifeData(childId: string): Observable<SchoolLifeData> {
    return forkJoin({
      calendarEvents: this.getCalendarEventsForChild(childId),
      homework: this.homeworkService.getHomeworkForChild(childId),
      reportCards: this.gradesService.getReportCardsForChild(childId)
    });
  }

  // Individual data getters if needed by specific components directly
  getHomework(childId: string): Observable<Homework[]> {
    return this.homeworkService.getHomeworkForChild(childId);
  }

  getReportCards(childId: string): Observable<ReportCard[]> {
    return this.gradesService.getReportCardsForChild(childId);
  }
}
