import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardEvent } from '../models/dashboard-event.model';
import { ChildSummary } from '../models/child-summary.model';
import { WeeklySchedule, ScheduleItem } from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor() { }

  // Exemple de méthode pour récupérer le résumé de l'enfant
  getChildSummary(childId: string): Observable<ChildSummary> {
    // Remplacer par un appel HTTP réel
    const mockSummary: ChildSummary = {
      childId: childId,
      name: 'Enfant Exemplaire',
      class: 'CM2',
      teacher: 'Mme. Dupont',
      canteenRegistered: true,
      homeworkDue: 3,
      upcomingEvents: 2
    };
    return of(mockSummary);
  }

  // Exemple de méthode pour récupérer les événements à venir
  getUpcomingEvents(): Observable<DashboardEvent[]> {
    // Remplacer par un appel HTTP réel
    const mockEvents: DashboardEvent[] = [
      {
        id: 'evt1',
        title: 'Réunion parents-professeurs',
        date: new Date('2025-06-15T18:00:00'),
        location: 'Salle polyvalente',
        description: 'Discussion sur les progrès du trimestre.'
      },
      {
        id: 'evt2',
        title: 'Kermesse de l\'école',
        date: new Date('2025-06-28T14:00:00'),
        location: 'Cour de l\'école',
        description: 'Jeux, stands et restauration.'
      }
    ];
    return of(mockEvents);
  }

  // Exemple de méthode pour récupérer les informations de la cantine
  getCanteenInfo(childId: string): Observable<any> {
    // Remplacer par un appel HTTP réel
    const mockCanteenInfo = {
      registered: true,
      nextWeekMenu: [
        { day: 'Lundi', meal: 'Poulet rôti et haricots verts' },
        { day: 'Mardi', meal: 'Poisson pané et purée' },
        { day: 'Mercredi', meal: 'Spaghetti bolognaise' },
        { day: 'Jeudi', meal: 'Steak haché et frites' },
        { day: 'Vendredi', meal: 'Pizza' }
      ]
    };
    return of(mockCanteenInfo);
  }

  // Exemple de méthode pour récupérer l'emploi du temps hebdomadaire
  getWeeklySchedule(childId: string, weekStartDate: Date): Observable<WeeklySchedule> {
    // Remplacer par un appel HTTP réel
    const mockSchedule: ScheduleItem[] = [
      // Lundi (Exemple: 20 Mai 2025)
      { id: 'sch1', day: 'Lundi', time: '08:30 - 12:00', activity: 'Classe (Maths, Français)', location: 'Salle 101', category: 'school' },
      { id: 'sch2', day: 'Lundi', time: '12:00 - 13:30', activity: 'Cantine', location: 'Réfectoire', category: 'canteen' },
      { id: 'sch3', day: 'Lundi', time: '13:30 - 16:30', activity: 'Classe (Histoire, Sciences)', location: 'Salle 101', category: 'school' },
      { id: 'sch4', day: 'Lundi', time: '17:00 - 18:00', activity: 'Devoirs (Maths)', category: 'homework' },
      // Mardi
      { id: 'sch5', day: 'Mardi', time: '08:30 - 12:00', activity: 'Classe (Anglais, Musique)', location: 'Salle 102', category: 'school' },
      { id: 'sch6', day: 'Mardi', time: '12:00 - 13:30', activity: 'Cantine', location: 'Réfectoire', category: 'canteen' },
      { id: 'sch7', day: 'Mardi', time: '13:30 - 16:30', activity: 'Sport (Gymnase)', location: 'Gymnase', category: 'school' },
      // Mercredi
      { id: 'sch8', day: 'Mercredi', time: '09:00 - 11:00', activity: 'Classe (Arts Plastiques)', location: 'Salle d\'arts', category: 'school' },
      { id: 'sch9', day: 'Mercredi', time: 'Après-midi', activity: 'Centre de loisirs (optionnel)', category: 'extracurricular' },
      // Jeudi
      { id: 'sch10', day: 'Jeudi', time: '08:30 - 12:00', activity: 'Classe (Français, Géographie)', location: 'Salle 101', category: 'school' },
      { id: 'sch11', day: 'Jeudi', time: '12:00 - 13:30', activity: 'Cantine', location: 'Réfectoire', category: 'canteen' },
      { id: 'sch12', day: 'Jeudi', time: '13:30 - 16:30', activity: 'Classe (Maths, Technologie)', location: 'Salle 101', category: 'school' },
      // Vendredi
      { id: 'sch13', day: 'Vendredi', time: '08:30 - 12:00', activity: 'Classe (Révisions, EPS)', location: 'Salle 102 / Terrain de sport', category: 'school' },
      { id: 'sch14', day: 'Vendredi', time: '12:00 - 13:30', activity: 'Cantine', location: 'Réfectoire', category: 'canteen' },
      { id: 'sch15', day: 'Vendredi', time: '13:30 - 15:30', activity: 'Bibliothèque', location: 'Bibliothèque municipale', category: 'extracurricular' },
    ];
    return of({ childId, weekStartDate, schedule: mockSchedule });
  }
}
