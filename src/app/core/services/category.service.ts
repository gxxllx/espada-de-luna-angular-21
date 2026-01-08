import { Injectable, inject } from '@angular/core';
import { ApiService, ApiResponse } from '../api';
import { ENDPOINTS } from '../constants/endpoints';
import { Observable } from 'rxjs';
import { Category } from '../models/category.models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly api = inject(ApiService);
  private readonly routes = ENDPOINTS.CATEGORY;

  getAll(): Observable<ApiResponse<Category[]>> {
    return this.api.get<Category[]>(`${this.routes.BASE}/`);
  }
}
