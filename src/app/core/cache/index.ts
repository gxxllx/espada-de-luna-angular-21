import { inject, Injectable, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private readonly defaultTTL = 24 * 60 * 60 * 1000;
  private readonly memoryCache = new Map<string, WritableSignal<unknown>>();
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  get<T>(key: string, ttl: number = this.defaultTTL): T | null {
    const memoryCacheSignal = this.memoryCache.get(key);
    if (memoryCacheSignal) {
      const value = memoryCacheSignal();
      if (value !== null) {
        return value as T;
      }
    }

    if (!this.isBrowser) {
      return null;
    }

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const parsedCache: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      if (now - parsedCache.timestamp > ttl) {
        this.clear(key);
        return null;
      }

      this.setMemoryCache(key, parsedCache.data);
      return parsedCache.data;
    } catch {
      this.clear(key);
      return null;
    }
  }

  set<T>(key: string, data: T): void {
    this.setMemoryCache(key, data);

    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch {
      // Ignorar errores de localStorage
    }
  }

  clear(key: string): void {
    const memoryCacheSignal = this.memoryCache.get(key);
    if (memoryCacheSignal) {
      memoryCacheSignal.set(null);
    }

    try {
      localStorage.removeItem(key);
    } catch {
      // Ignorar errores de localStorage
    }
  }

  clearAll(): void {
    this.memoryCache.forEach((cacheSignal) => {
      cacheSignal.set(null);
    });
    this.memoryCache.clear();

    try {
      localStorage.clear();
    } catch {
      // Ignorar errores de localStorage
    }
  }

  private setMemoryCache<T>(key: string, data: T): void {
    const cacheSignal = this.memoryCache.get(key);
    if (cacheSignal) {
      (cacheSignal as WritableSignal<T>).set(data);
    } else {
      const newSignal = signal(data);
      this.memoryCache.set(key, newSignal as WritableSignal<unknown>);
    }
  }
}
