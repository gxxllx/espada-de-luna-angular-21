import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '@/environments/environment';
import { map } from 'rxjs';

const hasAccessToken = (): boolean => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return false;

  return document.cookie.split(';').some((cookie) => cookie.trim().startsWith('access_token='));
};

export const authGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);

  if (hasAccessToken()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const authGuardLoggedIn: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const isAdmin = environment.isAdmin;

  if (!hasAccessToken()) {
    return true;
  }

  isAdmin ? router.navigate(['/dashboard']) : router.navigate(['/profile']);
  return false;
};

export const adminGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!hasAccessToken()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.currentUser();
  if (user) {
    if (user.role === 'admin') {
      return true;
    }
    router.navigate(['/login']);
    return false;
  }

  return authService.checkSession().pipe(
    map(() => {
      const currentUser = authService.currentUser();
      if (currentUser?.role === 'admin') {
        return true;
      }
      router.navigate(['/login']);
      return false;
    }),
  );
};
