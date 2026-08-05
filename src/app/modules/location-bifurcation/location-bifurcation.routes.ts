import { Route } from '@angular/router';

export const Routes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./location-list/location-list').then(c => c.LocationList)
    },
    {
        path: 'manage/:module/:id',
        loadComponent: () => import('./location-manage/location-manage').then(c => c.LocationManage)
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
    },
];

