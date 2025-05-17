import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CanteenSubscription } from '../models/canteen-subscription.model';
import { WeeklyMenu, DailyMenu, Meal } from '../models/meal-menu.model';

@Injectable({
  providedIn: 'root'
})
export class CanteenService {

  // Mock data pour les abonnements à la cantine
  private mockSubscriptions: CanteenSubscription[] = [
    {
      id: 'sub1',
      childId: 'child1_leo_dupont', // Léo Dupont
      startDate: new Date(2024, 8, 1), // 1er Septembre 2024
      endDate: null,
      type: 'full_week',
      isActive: true,
      createdAt: new Date(2024, 7, 15)
    },
    {
      id: 'sub2',
      childId: 'child2_mia_martin', // Mia Martin
      startDate: new Date(2024, 8, 1),
      endDate: new Date(2025, 5, 30), // 30 Juin 2025
      type: 'specific_days',
      specificDays: ['monday', 'tuesday', 'thursday'],
      isActive: true,
      createdAt: new Date(2024, 7, 20)
    }
  ];

  // Mock data pour les menus de la cantine
  private mockWeeklyMenus: WeeklyMenu[] = [
    {
      weekNumber: 20, // Semaine actuelle (exemple)
      year: 2025,
      menus: [
        {
          date: new Date(2025, 4, 19), // Lundi 19 Mai 2025
          starter: { id: 'meal1', name: 'Salade de tomates', allergens: ['none'] },
          mainCourse: { id: 'meal2', name: 'Poulet rôti et pommes de terre', allergens: ['none'] },
          dessert: { id: 'meal3', name: 'Compote de pommes', allergens: ['none'] },
          notes: 'Pain bio inclus'
        },
        {
          date: new Date(2025, 4, 20), // Mardi 20 Mai 2025
          starter: { id: 'meal4', name: 'Carottes râpées' },
          mainCourse: { id: 'meal5', name: 'Poisson pané et haricots verts', allergens: ['gluten', 'fish'] },
          dessert: { id: 'meal6', name: 'Yaourt nature' , allergens: ['milk']},
        },
        // Mercredi - pas de cantine dans cet exemple
        {
          date: new Date(2025, 4, 22), // Jeudi 22 Mai 2025
          starter: null,
          mainCourse: { id: 'meal7', name: 'Hachis Parmentier', allergens: ['milk', 'gluten'] },
          dessert: { id: 'meal8', name: 'Fruit de saison (Orange)' },
        },
        {
          date: new Date(2025, 4, 23), // Vendredi 23 Mai 2025
          starter: { id: 'meal9', name: 'Betteraves vinaigrette' },
          mainCourse: { id: 'meal10', name: 'Pizza au fromage', allergens: ['gluten', 'milk'] },
          dessert: { id: 'meal11', name: 'Glace à la vanille', allergens: ['milk'] },
          notes: 'Option végétarienne : Pizza aux légumes'
        }
      ]
    }
    // Ajoutez d'autres semaines si nécessaire
  ];

  constructor() { }

  getSubscriptionsForChild(childId: string): Observable<CanteenSubscription[]> {
    const subscriptions = this.mockSubscriptions.filter(sub => sub.childId === childId);
    return of(subscriptions).pipe(delay(500)); // Simule un appel réseau
  }

  getSubscriptionById(subscriptionId: string): Observable<CanteenSubscription | undefined> {
    const subscription = this.mockSubscriptions.find(sub => sub.id === subscriptionId);
    return of(subscription).pipe(delay(500));
  }

  // Récupère le menu pour une semaine donnée (par numéro de semaine et année)
  getWeeklyMenu(weekNumber: number, year: number): Observable<WeeklyMenu | undefined> {
    const menu = this.mockWeeklyMenus.find(m => m.weekNumber === weekNumber && m.year === year);
    return of(menu).pipe(delay(500));
  }

  // Récupère le menu du jour pour une date spécifique
  getDailyMenu(date: Date): Observable<DailyMenu | undefined> {
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Normalise la date
    for (const weeklyMenu of this.mockWeeklyMenus) {
      const daily = weeklyMenu.menus.find(dm => 
        new Date(dm.date.getFullYear(), dm.date.getMonth(), dm.date.getDate()).getTime() === today.getTime()
      );
      if (daily) {
        return of(daily).pipe(delay(300));
      }
    }
    return of(undefined).pipe(delay(300));
  }

  // CRUD opérations pour les abonnements (simulées)
  addSubscription(subscription: Omit<CanteenSubscription, 'id' | 'createdAt' | 'isActive'>): Observable<CanteenSubscription> {
    const newSubscription: CanteenSubscription = {
      ...subscription,
      id: `sub${this.mockSubscriptions.length + 1}`,
      isActive: true,
      createdAt: new Date(),
    };
    this.mockSubscriptions.push(newSubscription);
    return of(newSubscription).pipe(delay(500));
  }

  updateSubscription(subscription: CanteenSubscription): Observable<CanteenSubscription> {
    const index = this.mockSubscriptions.findIndex(s => s.id === subscription.id);
    if (index > -1) {
      this.mockSubscriptions[index] = { ...subscription, updatedAt: new Date() };
      return of(this.mockSubscriptions[index]).pipe(delay(500));
    }
    throw new Error('Subscription not found');
  }

  cancelSubscription(subscriptionId: string): Observable<boolean> {
    const index = this.mockSubscriptions.findIndex(s => s.id === subscriptionId);
    if (index > -1) {
      this.mockSubscriptions[index].isActive = false;
      this.mockSubscriptions[index].endDate = new Date();
      this.mockSubscriptions[index].updatedAt = new Date();
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }
}
