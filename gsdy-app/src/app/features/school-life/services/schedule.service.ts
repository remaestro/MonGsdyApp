import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Schedule, ScheduleEntry } from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  // Données mock pour l'instant
  private mockSchedules: Schedule[] = [
    {
      id: 'sched1',
      childId: 'child1', // Doit correspondre à un ID d'enfant existant
      schoolYear: '2023-2024',
      entries: [
        { id: 'entry1_1', dayOfWeek: 'Lundi', startTime: '08:00', endTime: '09:00', subject: 'Mathématiques', teacher: 'M. Dupont', room: '101', color: '#4CAF50' },
        { id: 'entry1_2', dayOfWeek: 'Lundi', startTime: '09:00', endTime: '10:00', subject: 'Français', teacher: 'Mme. Martin', room: '102', color: '#2196F3' },
        { id: 'entry1_3', dayOfWeek: 'Mardi', startTime: '10:00', endTime: '11:00', subject: 'Histoire', teacher: 'M. Durand', room: '103', color: '#FFC107' },
      ]
    },
    {
      id: 'sched2',
      childId: 'child2', // Doit correspondre à un ID d'enfant existant
      schoolYear: '2023-2024',
      entries: [
        { id: 'entry2_1', dayOfWeek: 'Mercredi', startTime: '08:30', endTime: '09:30', subject: 'Sciences', teacher: 'Mme. Lefevre', room: 'Lab A', color: '#E91E63' },
        { id: 'entry2_2', dayOfWeek: 'Jeudi', startTime: '14:00', endTime: '15:00', subject: 'Anglais', teacher: 'Mr. Smith', room: '201', color: '#9C27B0' },
      ]
    }
  ];

  constructor() { }

  getScheduleForChild(childId: string): Observable<Schedule | undefined> {
    // Simuler une récupération de données asynchrone
    // Dans une vraie application, cela appellerait une API backend
    const schedule = this.mockSchedules.find(s => s.childId === childId);
    return of(schedule);
  }

  // On pourrait ajouter d'autres méthodes ici, par exemple pour mettre à jour l'emploi du temps, etc.
}
