import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanteenMenuComponent } from './components/canteen-menu/canteen-menu.component';
import { CanteenSubscriptionComponent } from './components/canteen-subscription/canteen-subscription.component';

// Les routes sont relatives au chemin défini dans app-routing pour CanteenModule
// Par exemple, si CanteenModule est chargé sous /parent/canteen/:childId
// alors 'menu' deviendra /parent/canteen/:childId/menu

const routes: Routes = [
  {
    path: 'menu',
    component: CanteenMenuComponent
  },
  {
    path: 'subscriptions',
    component: CanteenSubscriptionComponent
  },
  {
    path: '', // Route par défaut pour la section cantine de l'enfant
    redirectTo: 'menu', // Redirige vers le menu par défaut
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CanteenRoutingModule { }
