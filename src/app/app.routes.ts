import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./homepage/homepage.component').then(m => m.HomepageComponent)
  },
  {
    path: 'game',
    loadComponent: () => import('./game-status/game-status.component').then(m => m.GameStatusComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard-routing.module').then(m => m.DashboardRoutingModule)
  },
  { path: '**', redirectTo: '' }
];
