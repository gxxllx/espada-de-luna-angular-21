import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'admin-theme';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  theme = signal<Theme>(this.getStoredTheme());

  toggle() {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.apply(next);
  }

  apply(theme: Theme = this.theme()) {
    if (!this.isBrowser) return;

    document.documentElement.dataset['theme'] = theme;
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  private getStoredTheme(): Theme {
    if (!this.isBrowser) return 'dark';

    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  }
}
