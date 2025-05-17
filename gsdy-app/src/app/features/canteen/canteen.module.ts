import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; // Importé pour CanteenSubscriptionComponent

import { CanteenRoutingModule } from './canteen-routing.module';

import { CanteenMenuComponent } from './components/canteen-menu/canteen-menu.component';
import { CanteenSubscriptionComponent } from './components/canteen-subscription/canteen-subscription.component';
// MealDetailsComponent n'est pas créé pour l'instant, à ajouter si besoin.

import { CanteenService } from './services/canteen.service';

@NgModule({
  declarations: [
    CanteenMenuComponent,
    CanteenSubscriptionComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule, // Ajouté pour les formulaires réactifs
    CanteenRoutingModule
  ],
  providers: [
    CanteenService
  ]
})
export class CanteenModule { }
