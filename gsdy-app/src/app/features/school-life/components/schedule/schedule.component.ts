import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChildrenService } from '../../../children/services/children.service';
import { Child } from '../../../children/models/child.model';
import { Schedule, ScheduleEntry } from '../../models/schedule.model';
import { ScheduleService } from '../../services/schedule.service'; // Import ScheduleService
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit, OnDestroy {
  selectedChild: Child | null = null;
  schedule: Schedule | null = null;
  isLoading = false;
  error: string | null = null;
  daysOfWeek: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  timeSlots: string[] = []; // Sera rempli dynamiquement

  private childSubscription: Subscription | undefined;

  constructor(
    private childrenService: ChildrenService,
    private scheduleService: ScheduleService, // Inject ScheduleService
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.childSubscription = this.childrenService.selectedChild$.subscribe(child => {
      if (child) {
        this.selectedChild = child;
        this.loadSchedule(child.id);
      } else {
        this.selectedChild = null;
        this.schedule = null;
      }
    });

    // Vérifier si un childId est passé en paramètre de route (par exemple, lien direct)
    const childIdFromRoute = this.route.snapshot.paramMap.get('childId');
    if (childIdFromRoute && !this.selectedChild) {
      // Optionnel: charger l'enfant si non déjà sélectionné ou si le service ne l'a pas encore émis
      // Pour l'instant, on suppose que le child-selector ou un autre mécanisme a déjà mis l'enfant dans le service
      // this.childrenService.setSelectedChild(childIdFromRoute); // Déclenchera le subscribe ci-dessus
      this.loadSchedule(childIdFromRoute);
    }
  }

  loadSchedule(childId: string): void {
    this.isLoading = true;
    this.error = null;
    this.scheduleService.getScheduleForChild(childId).subscribe({
      next: (data) => {
        this.schedule = data || null; // Assigner null si data est undefined
        if (this.schedule) {
          this.generateTimeSlots(this.schedule.entries);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = `Erreur lors du chargement de l'emploi du temps: ${err.message}`;
        this.isLoading = false;
        this.schedule = null;
      }
    });
  }

  generateTimeSlots(entries: ScheduleEntry[]): void {
    if (!entries || entries.length === 0) {
      this.timeSlots = [];
      return;
    }

    const slots = new Set<string>();
    entries.forEach(entry => {
      slots.add(this.formatTimeSlot(entry.startTime, entry.endTime));
    });

    this.timeSlots = Array.from(slots).sort((a, b) => {
      const timeA = a.split(' - ')[0];
      const timeB = b.split(' - ')[0];
      return timeA.localeCompare(timeB);
    });
  }

  formatTimeSlot(start: string, end: string): string {
    return `${start} - ${end}`;
  }

  getEntryForDayAndTime(day: string, timeSlot: string): ScheduleEntry | undefined {
    if (!this.schedule) return undefined;
    const [startTime, endTime] = timeSlot.split(' - ');
    return this.schedule.entries.find(entry =>
      entry.dayOfWeek === day &&
      entry.startTime === startTime &&
      entry.endTime === endTime
    );
  }

  ngOnDestroy(): void {
    if (this.childSubscription) {
      this.childSubscription.unsubscribe();
    }
  }
}
