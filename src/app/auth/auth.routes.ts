import { Route } from "@angular/router";

export const routes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login').then(c => c.Login),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  }
];
