import { Route } from "@angular/router";

export const Routes: Route[] = [
  {
    path: '',
    // loadComponent: () => import('./dashboard.component').then(c => c.DashboardComponent),
    loadComponent: () => import('./dashboard').then(c => c.Dashboard),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  
]
