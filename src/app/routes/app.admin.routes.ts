import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  // {
  //   path: '',
  //   loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  // },
  {
    path: '**',
    redirectTo: '', // Redirige al login del admin si la ruta falla
  },
];
