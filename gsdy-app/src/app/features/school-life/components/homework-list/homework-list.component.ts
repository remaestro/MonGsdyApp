import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Homework } from '../../models/homework.model';
import { HomeworkService } from '../../services/homework.service';
import { Observable, Subject, of } from 'rxjs';
import { switchMap, takeUntil, catchError, tap } from 'rxjs/operators';
import { ChildrenService } from '../../../children/services/children.service';
import { Child } from '../../../children/models/child.model';

@Component({
  selector: 'app-homework-list',
  templateUrl: './homework-list.component.html',
  styleUrls: ['./homework-list.component.css']
})
export class HomeworkListComponent implements OnInit, OnDestroy {
  homework$: Observable<Homework[]> | undefined;
  selectedChild: Child | null = null;
  isLoading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private homeworkService: HomeworkService,
    private childrenService: ChildrenService
  ) { }

  ngOnInit(): void {
    this.childrenService.selectedChild$.pipe(
      takeUntil(this.destroy$),
      tap(child => {
        this.selectedChild = child;
        this.isLoading = true;
        this.error = null;
        this.homework$ = undefined;
      }),
      switchMap(child => {
        if (child && child.id) {
          console.log('HomeworkListComponent: Loading homework for child', child.id);
          return this.homeworkService.getHomeworkForChild(child.id).pipe(
            catchError(err => {
              console.error('HomeworkListComponent: Error loading homework', err);
              this.error = 'Erreur lors du chargement des devoirs.';
              return of([]);
            })
          );
        } else {
          console.log('HomeworkListComponent: No child selected or child has no ID');
          return of([]);
        }
      })
    ).subscribe(
      (homework: Homework[]) => {
        this.homework$ = of(homework);
        this.isLoading = false;
        console.log('HomeworkListComponent: Homework loaded', homework);
        if (homework.length === 0 && !this.error && this.selectedChild) {
          // Optionnel: Mettre un message si aucun devoir n'est retourné mais pas d'erreur
        }
      },
      err => {
        this.isLoading = false;
        this.error = 'Une erreur inattendue est survenue.';
        console.error('HomeworkListComponent: Unexpected error in subscription', err);
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
