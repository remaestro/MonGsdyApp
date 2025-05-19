import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { switchMap, takeUntil, catchError, tap } from 'rxjs/operators';
import { Child } from '../../models/child.model';
import { ChildrenService } from '../../services/children.service';

@Component({
  selector: 'app-child-profile',
  templateUrl: './child-profile.component.html',
  styleUrls: ['./child-profile.component.css']
})
export class ChildProfileComponent implements OnInit, OnDestroy {
  child: Child | null = null;
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private childrenService: ChildrenService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.isLoading = true;
        this.error = null;
        this.child = null;
      }),
      switchMap(params => {
        const childId = params.get('id');
        if (childId) {
          return this.childrenService.getChildById(childId).pipe(
            catchError(err => {
              this.error = `Impossible de charger le profil de l'enfant. Erreur: ${err.message}`;
              console.error('Error loading child in ChildProfileComponent', err);
              return of(null);
            })
          );
        } else {
          this.error = 'Aucun identifiant d\'enfant fourni.';
          return of(null);
        }
      })
    ).subscribe(childOrNull => {
      this.isLoading = false;
      if (childOrNull) {
        this.child = childOrNull;
      } else if (!this.error) {
        this.error = "Profil d'enfant non trouvé.";
      }
    });
  }

  navigateToSchoolLife(): void {
    if (this.child) {
      this.childrenService.setSelectedChild(this.child);
      this.router.navigate(['/features/school-life', this.child.id, 'homework']);
    }
  }

  navigateToCanteen(): void {
    if (this.child) {
      this.childrenService.setSelectedChild(this.child);
      this.router.navigate(['/features/canteen', this.child.id, 'menu']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
