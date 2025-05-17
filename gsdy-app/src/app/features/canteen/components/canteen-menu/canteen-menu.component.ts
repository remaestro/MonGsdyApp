import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanteenService } from '../../services/canteen.service';
import { WeeklyMenu, DailyMenu } from '../../models/meal-menu.model';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-canteen-menu',
  templateUrl: './canteen-menu.component.html',
  styleUrls: ['./canteen-menu.component.css']
})
export class CanteenMenuComponent implements OnInit {
  weeklyMenu$!: Observable<WeeklyMenu | undefined>;
  childId!: string; // Pourrait être utilisé pour des personnalisations futures
  currentDate: Date = new Date(); // Ajout de currentDate
  currentWeekNumber!: number;
  currentYear!: number;
  errorLoadingMenu: boolean = false; // Ajout de errorLoadingMenu
  initialLoadComplete: boolean = false; // Ajout de initialLoadComplete

  constructor(
    private route: ActivatedRoute,
    private canteenService: CanteenService
  ) { }

  ngOnInit(): void {
    // Obtenir childId des paramètres de la route (même si pas directement utilisé pour le menu général)
    this.route.parent?.paramMap.subscribe(params => {
      this.childId = params.get('childId')!;
    });

    this.currentWeekNumber = this.getISOWeek(this.currentDate);
    this.currentYear = this.currentDate.getFullYear();

    this.loadMenuForWeek(this.currentWeekNumber, this.currentYear);
  }

  loadMenuForWeek(weekNumber: number, year: number): void {
    this.errorLoadingMenu = false;
    this.weeklyMenu$ = this.canteenService.getWeeklyMenu(weekNumber, year).pipe(
      map(menu => {
        this.initialLoadComplete = true;
        if (!menu) { this.errorLoadingMenu = true; }
        return menu;
      })
    );
  }

  // Rendre la fonction publique
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
    // TODO: Gérer le passage à l'année suivante si currentWeekNumber > 51/52
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
}
