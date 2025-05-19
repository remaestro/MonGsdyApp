import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';

// Pages d'erreur
import { NotFoundPageComponent } from './core/error-handling/components/not-found-page/not-found-page.component';
import { ServerErrorPageComponent } from './core/error-handling/components/server-error-page/server-error-page.component';
import { AccessDeniedPageComponent } from './core/error-handling/components/access-denied-page/access-denied-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'profile',
    loadChildren: () => import('./features/user-profile/user-profile.module').then(m => m.UserProfileModule),
    canActivate: [authGuard] 
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [roleGuard], 
    data: { roles: ['admin'] } 
  },
  { 
    path: 'notifications', 
    loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule),
    canActivate: [authGuard]
  },
  // Route parent pour les features des parents d'élèves
  {
    path: 'parent',
    canActivate: [authGuard],
    children: [
      {
        path: 'messaging',
        loadChildren: () => import('./features/messaging/messaging.module').then(m => m.MessagingModule)
      },
      {
        path: 'documents',
        loadChildren: () => import('./features/documents/documents.module').then(m => m.DocumentsModule)
      },
      {
        path: 'activities',
        loadChildren: () => import('./features/activities/activities.module').then(m => m.ActivitiesModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/parent-dashboard/parent-dashboard.module').then(m => m.ParentDashboardModule)
      },
      {
        path: 'children', // Nouvelle route pour la gestion des enfants
        loadChildren: () => import('./features/children/children.module').then(m => m.ChildrenModule)
      },
      {
        path: 'school-life/:childId', // Nouvelle route pour la vie scolaire par enfant
        loadChildren: () => import('./features/school-life/school-life.module').then(m => m.SchoolLifeModule)
      },
      {
        path: 'canteen/:childId', // Nouvelle route pour la cantine par enfant
        loadChildren: () => import('./features/canteen/canteen.module').then(m => m.CanteenModule)
      }
    ]
  },
  {
    path: 'admin/dashboard',
    loadChildren: () => import('./features/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule)
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
