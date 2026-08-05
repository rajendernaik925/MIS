import { Route } from '@angular/router';

export const Routes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./intern-list/intern-list').then(c => c.InternList)
    },
    {
        path: 'manage/:module/:id',
        loadComponent: () => import('./intern-manage/intern-manage').then(c => c.InternManage)
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
    },
];

