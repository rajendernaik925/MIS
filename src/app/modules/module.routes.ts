import { Route } from "@angular/router";
import { BaseLayout } from "../base-layout/base-layout";

export const Routes: Route[] = [
  {
    path: '',
    component: BaseLayout,
    children: [
      {
        path: 'dashboard',
        // loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.Routes),
        loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.Routes),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ]
  },
];
