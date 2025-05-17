import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CalendarEvent } from '../../models/calendar-event.model';
import { SchoolLifeService } from '../../services/school-life.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  @Input() childId: string | undefined;
  calendarEvents$: Observable<CalendarEvent[]> = of([]);

  // Basic view control (can be expanded)
  currentMonth: Date = new Date();
  // TODO: Implement actual calendar view logic (days, weeks, etc.)

  constructor(private schoolLifeService: SchoolLifeService) { }

  ngOnInit(): void {
    if (this.childId) {
      this.calendarEvents$ = this.schoolLifeService.getCalendarEventsForChild(this.childId);
    }
  }

  // TODO: Add methods for navigating months, event details, etc.
  // For a real calendar, consider using a library like angular-calendar by mattlewis92
}
