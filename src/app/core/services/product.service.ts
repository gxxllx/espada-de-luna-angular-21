import { Injectable, inject } from '@angular/core';
import { ApiService, ApiResponse } from '../api';
import { CacheService } from '../cache';
import { ENDPOINTS } from '../constants/endpoints';
import { Observable, of, tap } from 'rxjs';
import { Product, ProductDetail } from '../models/product.models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly api = inject(ApiService);
  private readonly cache = inject(CacheService);
  private readonly routes = ENDPOINTS.PRODUCT;
  private readonly TTL = 60 * 60 * 1000; // 1 hora

  getAll(): Observable<ApiResponse<Product[]>> {
    const key = 'products:all';
    const cached = this.cache.get<ApiResponse<Product[]>>(key, this.TTL);
    if (cached) return of(cached);

    return this.api
      .get<Product[]>(`${this.routes.BASE}`)
      .pipe(tap((res) => this.cache.set(key, res)));
  }

  getById(id: number): Observable<ApiResponse<Product>> {
    return this.api.get<Product>(`${this.routes.BASE}/${id}`);
  }

  getByCategorySlug(categorySlug: string): Observable<ApiResponse<Product[]>> {
    const key = `products:category:${categorySlug}`;
    const cached = this.cache.get<ApiResponse<Product[]>>(key, this.TTL);
    if (cached) return of(cached);

    return this.api
      .get<Product[]>(`${this.routes.BASE}/${this.routes.CATEGORY}/${categorySlug}`)
      .pipe(tap((res) => this.cache.set(key, res)));
  }

  getBySlug(slug: string): Observable<ApiResponse<ProductDetail>> {
    return this.api.get<ProductDetail>(`${this.routes.BASE}/${this.routes.SLUG}/${slug}`);
  }
}
