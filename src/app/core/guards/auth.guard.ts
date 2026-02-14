import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const hasToken = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('access_token='));

  if (hasToken && authService.isLoggedIn()) {
    return true;
  }

  // Si queremos guardar la URL de destino
  // podemos utilizar el state y el router

  router.navigate(['/login']);
  return false;
};
