import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { ChildrenService } from '../../../children/services/children.service';
import { Child } from '../../../children/models/child.model';
// Importer les services et modèles nécessaires pour la vie scolaire (devoirs, emploi du temps, notes)
// import { HomeworkService } from '../../services/homework.service';
// import { ScheduleService } from '../../services/schedule.service';
// import { GradesService } from '../../services/grades.service';

@Component({
  selector: 'app-school-life',
  templateUrl: './school-life.component.html',
  styleUrls: ['./school-life.component.css']
})
export class SchoolLifeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  selectedChild: Child | null = null;
  childId: string | null = null;

  // Observables pour les données de la vie scolaire
  // homework$: Observable<any[]> | undefined;
  // schedule$: Observable<any> | undefined;
  // grades$: Observable<any[]> | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private childrenService: ChildrenService,
    // private homeworkService: HomeworkService,
    // private scheduleService: ScheduleService,
    // private gradesService: GradesService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const idFromRoute = params.get('childId');
        if (idFromRoute) {
          this.childrenService.setSelectedChild(idFromRoute);
        }
        return this.childrenService.selectedChild$;
      })
    ).subscribe(child => {
      this.selectedChild = child;
      this.childId = child ? child.id : null;
      if (this.childId) {
        console.log('SchoolLifeComponent: Child selected', this.childId);
        // Charger les données spécifiques à l'enfant pour la vie scolaire
        // this.loadSchoolLifeData(this.childId);
      } else {
        console.log('SchoolLifeComponent: No child selected');
        // Rediriger si aucun enfant n'est sélectionné et que la page nécessite un enfant
        // Par exemple, vers le sélecteur d'enfant ou une page d'accueil
        // this.router.navigate(['/features/children/select']); // Adapter la route
      }
    });
  }

  // loadSchoolLifeData(childId: string): void {
  //   this.homework$ = this.homeworkService.getHomeworkForChild(childId);
  //   this.schedule$ = this.scheduleService.getScheduleForChild(childId);
  //   this.grades$ = this.gradesService.getGradesForChild(childId);
  // }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
