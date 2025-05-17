import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportCard } from '../../models/report-card.model';
import { GradesService } from '../../services/grades.service';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-report-card',
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.css']
})
export class ReportCardComponent implements OnInit {
  reportCard$!: Observable<ReportCard | undefined>;
  childId!: string;

  constructor(
    private route: ActivatedRoute,
    private gradesService: GradesService
  ) { }

  ngOnInit(): void {
    this.reportCard$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.childId = params.get('childId')!;
        // Utiliser getReportCardsForChild et prendre le premier élément s'il existe
        return this.gradesService.getReportCardsForChild(this.childId).pipe(
          map(reportCards => reportCards.length > 0 ? reportCards[0] : undefined)
        );
      })
    );
  }

  // Commenté car la logique de calcul de moyenne doit être revue
  // getOverallAverage(reportCard: ReportCard): number {
  //   if (!reportCard || !reportCard.subjects || reportCard.subjects.length === 0) {
  //     return 0;
  //   }
  //   const numericGrades = reportCard.subjects.map(s => s.grade).filter(g => typeof g === 'number') as number[];
  //   if (numericGrades.length === 0) return 0;
  //   const total = numericGrades.reduce((sum, grade) => sum + grade, 0);
  //   return total / numericGrades.length;
  // }
}
