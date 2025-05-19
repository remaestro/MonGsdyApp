import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportCard } from '../../models/report-card.model';
import { GradesService } from '../../services/grades.service';
import { Observable, Subject, of } from 'rxjs';
import { switchMap, map, takeUntil, catchError, tap } from 'rxjs/operators';
import { ChildrenService } from '../../../children/services/children.service';
import { Child } from '../../../children/models/child.model';

@Component({
  selector: 'app-report-card',
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.css']
})
export class ReportCardComponent implements OnInit, OnDestroy {
  reportCard$: Observable<ReportCard | undefined> | undefined;
  selectedChild: Child | null = null;
  isLoading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private gradesService: GradesService,
    private childrenService: ChildrenService
  ) { }

  ngOnInit(): void {
    this.childrenService.selectedChild$.pipe(
      takeUntil(this.destroy$),
      tap(child => {
        this.selectedChild = child;
        this.isLoading = true;
        this.error = null;
        this.reportCard$ = undefined;
      }),
      switchMap(child => {
        if (child && child.id) {
          console.log('ReportCardComponent: Loading report card for child', child.id);
          return this.gradesService.getReportCardsForChild(child.id).pipe(
            map(reportCards => reportCards.length > 0 ? reportCards[0] : undefined),
            catchError(err => {
              console.error('ReportCardComponent: Error loading report card', err);
              this.error = 'Erreur lors du chargement du bulletin.';
              return of(undefined);
            })
          );
        } else {
          console.log('ReportCardComponent: No child selected or child has no ID');
          return of(undefined);
        }
      })
    ).subscribe(
      (reportCard: ReportCard | undefined) => {
        this.reportCard$ = of(reportCard);
        this.isLoading = false;
        console.log('ReportCardComponent: Report card loaded', reportCard);
        if (!reportCard && !this.error && this.selectedChild) {
          // Optionnel: Message si aucun bulletin n'est trouvé
        }
      },
      err => {
        this.isLoading = false;
        this.error = 'Une erreur inattendue est survenue.';
        console.error('ReportCardComponent: Unexpected error in subscription', err);
      }
    );
  }

  getOverallAverage(reportCard: ReportCard): number {
    if (!reportCard || !reportCard.subjects || reportCard.subjects.length === 0) {
      return 0;
    }
    const numericGrades = reportCard.subjects
      .filter(s => typeof s.grade === 'number' && s.subjectName !== 'Moyenne Générale')
      .map(s => s.grade as number);

    if (numericGrades.length === 0) return 0;
    const total = numericGrades.reduce((sum, grade) => sum + grade, 0);
    return total / numericGrades.length;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
