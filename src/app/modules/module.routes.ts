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
        path: 'payable',
        loadChildren: () => import('./paybale-summary/payable-summary.routes').then(m => m.Routes),
      },
      {
        path: 'location-bifurcation',
        loadChildren: () => import('./location-bifurcation/location-bifurcation.routes').then(m => m.Routes),
      },
      {
        path: 'joins-exits',
        loadChildren: () => import('./join&exit/join.routes').then(m => m.Routes),
      },
      {
        path: 'interns',
        loadChildren: () => import('./interns&contractors/intern.routes').then(m => m.Routes),
      },
      {
        path: 'methodology',
        loadChildren: () => import('./methodology/methodology.routes').then(m => m.Routes),
      },
      {
        path: 'forecast',
        loadChildren: () => import('./forecast/forecast.routes').then(m => m.Routes),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ]
  },
];
