import { Route } from '@angular/router';

export const Routes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./join-list/join-list').then(c => c.JoinList)
    },
    {
        path: 'graph',
        loadComponent: () => import('./join-manage/join-manage').then(c => c.JoinManage)
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
    },
];

