import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ColorPaletteDemoComponent } from './color-palette-demo.component';
import { LoginComponent } from './core/auth/login/login.component';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';

// Pages d'erreur
import { NotFoundPageComponent } from './core/error-handling/components/not-found-page/not-found-page.component';
import { ServerErrorPageComponent } from './core/error-handling/components/server-error-page/server-error-page.component';
import { AccessDeniedPageComponent } from './core/error-handling/components/access-denied-page/access-denied-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: ColorPaletteDemoComponent, canActivate: [authGuard] },
  { path: 'profile', component: ColorPaletteDemoComponent, canActivate: [authGuard] },
  { path: 'settings', component: ColorPaletteDemoComponent, canActivate: [authGuard] },
  { 
    path: 'admin', 
    component: ColorPaletteDemoComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['admin'] } 
  },
  // Routes pour les pages d'erreur
  { path: 'access-denied', component: AccessDeniedPageComponent },
  { path: 'not-found', component: NotFoundPageComponent },
  { path: 'server-error', component: ServerErrorPageComponent },
  // Catch-all route pour les pages non trouvées
  { path: '**', component: NotFoundPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
