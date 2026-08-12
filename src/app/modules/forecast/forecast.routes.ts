import { Route } from '@angular/router';

export const Routes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./forecast-list/forecast-list').then(c => c.ForecastList)
    },
    {
        path: 'manage/:module/:id',
        loadComponent: () => import('./forecast-manage/forecast-manage').then(c => c.ForecastManage)
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
    },
];

