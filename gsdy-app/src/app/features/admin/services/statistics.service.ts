import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StudentCountByLevel, CanteenUsageStats } from '../models/statistic-details.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor() { }

  getStudentCountByLevel(): Observable<StudentCountByLevel[]> {
    const mockData: StudentCountByLevel[] = [
      { level: 'CP', count: 80 },
      { level: 'CE1', count: 85 },
      { level: 'CE2', count: 78 },
      { level: 'CM1', count: 92 },
      { level: 'CM2', count: 87 },
    ];
    return of(mockData);
  }

  getCanteenUsageStats(): Observable<CanteenUsageStats> {
    const totalStudents = 452; // Supposons que ce chiffre vient d'une autre source ou est une constante ici
    const registeredForCanteen = 350;
    const mockData: CanteenUsageStats = {
      totalStudents: totalStudents,
      registeredForCanteen: registeredForCanteen,
      registrationRate: parseFloat(((registeredForCanteen / totalStudents) * 100).toFixed(1)),
      dailyAttendance: [
        { day: 'Lundi', count: 320 },
        { day: 'Mardi', count: 315 },
        { day: 'Jeudi', count: 330 },
        { day: 'Vendredi', count: 300 },
      ]
    };
    return of(mockData);
  }

  // D'autres méthodes pour des statistiques plus détaillées pourraient être ajoutées ici.
  // Par exemple, pour des graphiques spécifiques :
  // getMonthlyAttendanceTrend(): Observable<any> { ... }
  // getExamResultsDistribution(): Observable<any> { ... }
}
