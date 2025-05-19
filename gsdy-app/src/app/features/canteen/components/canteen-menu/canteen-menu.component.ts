import { Component, OnInit, OnDestroy } from '@angular/core'; // Ajout de OnDestroy
import { ActivatedRoute } from '@angular/router';
import { CanteenService } from '../../services/canteen.service';
import { WeeklyMenu, DailyMenu } from '../../models/meal-menu.model';
import { Observable, Subject } from 'rxjs'; // Ajout de Subject
import { switchMap, map, takeUntil } from 'rxjs/operators'; // Ajout de takeUntil
import { ChildrenService } from '../../../children/services/children.service'; // Importer ChildrenService
import { Child } from '../../../children/models/child.model'; // Importer Child

@Component({
  selector: 'app-canteen-menu',
  templateUrl: './canteen-menu.component.html',
  styleUrls: ['./canteen-menu.component.css']
})
export class CanteenMenuComponent implements OnInit, OnDestroy { // Implémenter OnDestroy
  weeklyMenu$!: Observable<WeeklyMenu | undefined>;
  childId: string | null = null; // Peut être null initialement
  currentDate: Date = new Date();
  currentWeekNumber!: number;
  currentYear!: number;
  errorLoadingMenu: boolean = false;
  initialLoadComplete: boolean = false;
  private destroy$ = new Subject<void>(); // Pour la désinscription

  constructor(
    private route: ActivatedRoute,
    private canteenService: CanteenService,
    private childrenService: ChildrenService // Injecter ChildrenService
  ) { }

  ngOnInit(): void {
    // 1. Écouter les paramètres de la route pour childId
    this.route.parent?.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const idFromRoute = params.get('childId');
      if (idFromRoute) {
        // Demander au service de mettre à jour l'enfant sélectionné
        // Le service gérera en interne s'il doit réellement changer l'enfant ou non
        this.childrenService.setSelectedChild(idFromRoute);
      }
    });

    // 2. S'abonner à l'enfant sélectionné depuis ChildrenService
    this.childrenService.selectedChild$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((selectedChild: Child | null) => {
      if (selectedChild) {
        this.childId = selectedChild.id;
        console.log('CanteenMenuComponent: Selected child updated', this.childId);
        // Si le menu doit être spécifique à l'enfant et que la logique de chargement est ici,
        // vous pourriez appeler this.loadMenuForWeek(...) ou une méthode similaire.
        // Actuellement, le menu semble général.
      } else {
        this.childId = null;
        console.log('CanteenMenuComponent: No child selected');
        // Gérer l'absence d'enfant sélectionné (par exemple, désactiver certaines fonctionnalités ou afficher un message)
      }
    });

    this.currentWeekNumber = this.getISOWeek(this.currentDate);
    this.currentYear = this.currentDate.getFullYear();
    // Le chargement initial du menu se fait ici. Si le menu dépend de l'enfant,
    // il faudrait peut-être le déplacer dans le callback de selectedChild$ ou s'assurer
    // que selectedChild$ émet une valeur avant ce point (par exemple, via un resolver de route
    // ou une initialisation dans le constructeur de ChildrenService).
    this.loadMenuForWeek(this.currentWeekNumber, this.currentYear);
  }

  loadMenuForWeek(weekNumber: number, year: number): void {
    this.errorLoadingMenu = false;
    this.initialLoadComplete = false; // Réinitialiser pour chaque chargement
    this.weeklyMenu$ = this.canteenService.getWeeklyMenu(weekNumber, year).pipe(
      map(menu => {
        this.initialLoadComplete = true;
        if (!menu) { this.errorLoadingMenu = true; }
        return menu;
      })
    );
  }

  getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  goToPreviousWeek(): void {
    if (this.currentWeekNumber === 1) {
      this.currentWeekNumber = 52; // Ou 53, selon l'année
      this.currentYear--;
    } else {
      this.currentWeekNumber--;
    }
    this.loadMenuForWeek(this.currentWeekNumber, this.currentYear);
  }

  goToNextWeek(): void {
    if (this.currentWeekNumber === 52) { // Simplifié, une logique plus robuste est nécessaire pour les semaines 52/53
        this.currentWeekNumber = 1;
        this.currentYear++;
    } else {
        this.currentWeekNumber++;
    }
    this.loadMenuForWeek(this.currentWeekNumber, this.currentYear);
  }

  goToCurrentWeek(): void {
    this.currentWeekNumber = this.getISOWeek(new Date());
    this.currentYear = new Date().getFullYear();
    this.loadMenuForWeek(this.currentWeekNumber, this.currentYear);
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }

  ngOnDestroy(): void { // Méthode ngOnDestroy
    this.destroy$.next();
    this.destroy$.complete();
  }
}
