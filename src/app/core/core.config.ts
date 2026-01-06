import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject, provideAppInitializer } from '@angular/core';
import { translateProviders } from './i18n/translate.config';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { AuthService } from './services/auth.service';
import { firstValueFrom } from 'rxjs';

export const CORE_CONFIG = [
  ...translateProviders,
  provideHttpClient(withInterceptors([credentialsInterceptor])),
  provideAppInitializer(() => {
    const authService = inject(AuthService);
    return firstValueFrom(authService.checkSession());
  }),
  // Guards and other core providers can be added here
];
