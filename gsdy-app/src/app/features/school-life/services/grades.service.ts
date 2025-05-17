import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportCard, SubjectGrade } from '../models/report-card.model';

@Injectable({
  providedIn: 'root' // Ou dans un module spécifique si préféré
})
export class GradesService {

  private mockReportCards: ReportCard[] = [
    {
      id: 'rc1',
      childId: '1', // Léo Dupont
      period: 'Trimestre 1 - 2024/2025',
      issueDate: new Date('2024-12-15'),
      overallAppreciation: 'Léo est un élève sérieux et motivé. Des progrès notables en lecture.',
      subjects: [
        { subjectName: 'Mathématiques', grade: '15/20', teacherAppreciation: 'Bon ensemble.' },
        { subjectName: 'Français', grade: '16/20', teacherAppreciation: 'Très bien à l\'écrit.' },
        { subjectName: 'Histoire-Géographie', grade: '14/20', teacherAppreciation: 'Participe activement.' },
      ],
      downloadUrl: '/assets/mocks/bulletin_leo_t1.pdf'
    },
    {
      id: 'rc2',
      childId: '2', // Mia Dupont
      period: 'Trimestre 1 - 2024/2025',
      issueDate: new Date('2024-12-15'),
      overallAppreciation: 'Mia s\'adapte bien à la classe de CP. Elle est curieuse et apprend vite.',
      subjects: [
        { subjectName: 'Lecture', grade: 'Acquis', teacherAppreciation: 'Excellente progression.' },
        { subjectName: 'Écriture', grade: 'En cours d\'acquisition', teacherAppreciation: 'Poursuivre les efforts.' },
        { subjectName: 'Mathématiques', grade: 'Acquis', teacherAppreciation: 'Très bon travail.' },
      ],
      downloadUrl: '/assets/mocks/bulletin_mia_t1.pdf'
    }
  ];

  constructor() { }

  getReportCardsForChild(childId: string): Observable<ReportCard[]> {
    return of(this.mockReportCards.filter(rc => rc.childId === childId));
  }

  // TODO: Ajouter une méthode pour récupérer un bulletin spécifique par son ID si nécessaire
}
