import { Route } from '@angular/router';

export const Routes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./methodology-list/methodology-list').then(c => c.MethodologyList)
    },
    {
        path: 'details/:module/:id',
        loadComponent: () => import('./methodology-manage/methodology-manage').then(c => c.MethodologyManage)
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
    },
];

