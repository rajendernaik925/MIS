import { Routes } from '@angular/router';
import { loginGuard } from './core/guards/login.guard';
import { authGuard } from './core/guards/auth-guards';
import { PageNotFound } from './page-not-found/page-not-found';
import { ServerError } from './shared/components/server-error/server-error';

export const routes: Routes = [

  // Auth Module (Login / Register)
  {
    path: 'auth',
    canActivate: [loginGuard],
    loadChildren: () => import('./auth/auth.routes').then(m => m.routes),
  },

  // Protected Application Routes
  {
    path: '',
    canActivateChild: [authGuard],
    loadChildren: () => import('./modules/module.routes').then(m => m.Routes),
  },

  // Server Error
  {
    path: 'server-error',
    component: ServerError
  },

  // 404
  {
    path: '**',
    component: PageNotFound
  }

];