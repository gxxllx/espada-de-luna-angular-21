import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, provideAppInitializer } from '@angular/core';
import { translateProviders } from './i18n/translate.config';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { AuthService } from './services/auth.service';
import { firstValueFrom } from 'rxjs';

export const CORE_CONFIG = [
  ...translateProviders,
  provideHttpClient(withInterceptors([credentialsInterceptor]), withFetch()),
  provideAppInitializer(() => {
    const authService = inject(AuthService);
    const platformId = inject(PLATFORM_ID);

    if (isPlatformBrowser(platformId)) {
      return firstValueFrom(authService.checkSession());
    }
    return Promise.resolve();
  }),
  // Guards and other core providers can be added here
];
