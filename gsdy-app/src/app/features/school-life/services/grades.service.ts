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
      childId: 'child1', // Léo Dupont - ID mis à jour pour correspondre à ChildrenService
      period: 'Trimestre 1 - 2023/2024', // Année scolaire mise à jour
      issueDate: new Date('2023-12-15'),
      overallAppreciation: 'Léo est un élève sérieux et motivé. Des progrès notables en lecture.',
      subjects: [
        { subjectName: 'Mathématiques', grade: 15, teacherAppreciation: 'Bon ensemble.', coefficient: 2 },
        { subjectName: 'Français', grade: 16, teacherAppreciation: 'Très bien à l\'écrit.', coefficient: 2 },
        { subjectName: 'Histoire-Géographie', grade: 14, teacherAppreciation: 'Participe activement.', coefficient: 1 },
      ],
      downloadUrl: '/assets/mocks/bulletin_leo_t1.pdf'
    },
    {
      id: 'rc1-t2',
      childId: 'child1', // Léo Dupont
      period: 'Trimestre 2 - 2023/2024',
      issueDate: new Date('2024-03-20'),
      overallAppreciation: 'Ensemble satisfaisant. Poursuivre les efforts en mathématiques.',
      subjects: [
        { subjectName: 'Mathématiques', grade: 13.5, teacherAppreciation: 'Peut mieux faire.', coefficient: 2 },
        { subjectName: 'Français', grade: 15, teacherAppreciation: 'Bonne participation.', coefficient: 2 },
        { subjectName: 'Histoire-Géographie', grade: 16, teacherAppreciation: 'Excellent trimestre.', coefficient: 1 },
      ],
      downloadUrl: '/assets/mocks/bulletin_leo_t2.pdf'
    },
    {
      id: 'rc2',
      childId: 'child2', // Bob Dupont - ID mis à jour
      period: 'Trimestre 1 - 2023/2024',
      issueDate: new Date('2023-12-15'),
      overallAppreciation: 'Mia s\'adapte bien à la classe de CP. Elle est curieuse et apprend vite.',
      subjects: [
        // Utilisation d'un système de notation différent pour cet exemple (compétences)
        { subjectName: 'Lecture', grade: 'Acquis', teacherAppreciation: 'Excellente progression.' },
        { subjectName: 'Écriture', grade: 'En cours d\'acquisition', teacherAppreciation: 'Poursuivre les efforts.' },
        { subjectName: 'Mathématiques', grade: 'Acquis', teacherAppreciation: 'Très bon travail.' },
      ],
      downloadUrl: '/assets/mocks/bulletin_mia_t1.pdf'
    }
  ];

  constructor() { }

  getReportCardsForChild(childId: string): Observable<ReportCard[]> {
    // Filtrer les bulletins pour l'enfant spécifié
    const reportCards = this.mockReportCards.filter(rc => rc.childId === childId);
    // Trier par date de publication (plus récent en premier)
    reportCards.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
    return of(reportCards);
  }

  // TODO: Ajouter une méthode pour récupérer un bulletin spécifique par son ID si nécessaire
}
