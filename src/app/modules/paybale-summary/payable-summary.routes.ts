import { Route } from '@angular/router';

export const Routes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./list/list').then(c => c.List)
    },
    {
        path: 'individual-summary',
        loadComponent: () => import('./manage/manage').then(c => c.Manage)
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
    },
];

