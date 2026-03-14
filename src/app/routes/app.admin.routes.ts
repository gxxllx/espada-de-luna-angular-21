import { Routes } from '@angular/router';
import { adminGuard, authGuardLoggedIn } from '../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../features/auth/login/login').then((m) => m.Login),
    canActivate: [authGuardLoggedIn],
  },
  {
    path: 'login/2fa',
    loadComponent: () =>
      import('../features/auth/login/two-factor/two-factor').then((m) => m.TwoFactor),
  },
  {
    path: '',
    loadComponent: () => import('../layout/layout').then((m) => m.Layout),
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../features/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('../features/admin/products/product-detail/product-detail').then(
            (m) => m.ProductDetail,
          ),
      },
      {
        path: 'products/edit/:id',
        loadComponent: () =>
          import('../features/admin/products/product-detail/product-detail').then(
            (m) => m.ProductDetail,
          ),
      },
      {
        path: 'products',
        loadComponent: () => import('../features/admin/products/products').then((m) => m.Products),
      },
      {
        path: 'orders',
        loadComponent: () => import('../features/admin/orders/orders').then((m) => m.Orders),
      },
      {
        path: 'users',
        loadComponent: () => import('../features/admin/users/users').then((m) => m.Users),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('../features/admin/categories/categories').then((m) => m.Categories),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
