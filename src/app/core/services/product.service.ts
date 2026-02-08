import { Injectable, inject } from '@angular/core';
import { ApiService, ApiResponse } from '../api';
import { ENDPOINTS } from '../constants/endpoints';
import { Observable } from 'rxjs';
import { Product, ProductDetail } from '../models/product.models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly api = inject(ApiService);
  private readonly routes = ENDPOINTS.PRODUCT;

  getAll(): Observable<ApiResponse<Product[]>> {
    return this.api.get<Product[]>(`${this.routes.BASE}`);
  }

  getById(id: number): Observable<ApiResponse<Product>> {
    return this.api.get<Product>(`${this.routes.BASE}/${id}`);
  }

  getBySlug(slug: string): Observable<ApiResponse<ProductDetail>> {
    return this.api.get<ProductDetail>(`${this.routes.BASE}/${this.routes.SLUG}/${slug}`);
  }
}
