import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../layout/layout').then((m) => m.Layout),
    children: [
      {
        path: '',
        loadComponent: () => import('../features/home/home').then((m) => m.Home),
      },
      {
        path: 'login',
        loadComponent: () => import('../features/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () => import('../features/auth/register/register').then((m) => m.Register),
      },
      {
        path: 'profile',
        loadComponent: () => import('../features/profile/profile').then((m) => m.Profile),
        canActivate: [authGuard],
      },
      {
        path: 'collections/:category',
        loadComponent: () =>
          import('../features/collections/collections').then((m) => m.Collections),
      },
      {
        path: 'product/:slug',
        loadComponent: () => import('../features/product/product').then((m) => m.Product),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
