import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then((m) => m.Layout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
      },
      {
        path: 'collections/:category',
        loadComponent: () =>
          import('./features/collections/collections').then((m) => m.Collections),
      },
      {
        path: 'product/:slug',
        loadComponent: () => import('./features/product/product').then((m) => m.Product),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
