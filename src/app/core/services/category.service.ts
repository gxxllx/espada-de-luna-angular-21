import { Injectable, inject } from '@angular/core';
import { ApiService, ApiResponse } from '../api';
import { CacheService } from '../cache';
import { ENDPOINTS } from '../constants/endpoints';
import { Observable, of, tap } from 'rxjs';
import { Category } from '../models/category.models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly api = inject(ApiService);
  private readonly cache = inject(CacheService);
  private readonly cacheKey = 'categories';
  private readonly routes = ENDPOINTS.CATEGORY;

  getAll(): Observable<ApiResponse<Category[]>> {
    const cached = this.cache.get<Category[]>(this.cacheKey);
    if (cached) {
      return of({ data: cached });
    }

    return this.api.get<Category[]>(`${this.routes.BASE}`).pipe(
      tap((response) => {
        this.cache.set(this.cacheKey, response.data);
      }),
    );
  }

  clearCache(): void {
    this.cache.clear(this.cacheKey);
  }
}
