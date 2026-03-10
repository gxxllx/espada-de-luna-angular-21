import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductAdmin } from '@/app/core/models/product.models';
import { ProductService } from '@/app/core/services/product.service';
import { Pagination } from '@/app/shared/components/pagination/pagination';
import { Button } from '@/app/shared/components/button/button';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [Pagination, Button],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  readonly products = signal<ProductAdmin[]>([]);
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = signal<number>(20);
  readonly totalPages = signal<number>(1);
  readonly totalItems = signal<number>(0);

  constructor() {
    this.loadProducts(1);
  }

  loadProducts(page: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.productService.getAllByAdmin(page, this.itemsPerPage()).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.currentPage.set(response.meta?.current_page ?? page);
        this.totalPages.set(response.meta?.total_pages ?? 1);
        this.totalItems.set(response.meta?.total_items ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la lista de productos.');
        this.products.set([]);
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    if (this.loading()) return;
    if (page === this.currentPage()) return;

    this.loadProducts(page);
  }

  editProduct(productId: number): void {
    console.log('Editar producto', productId);
  }

  deleteProduct(productId: number): void {
    console.log('Eliminar producto', productId);
  }

  createProduct(): void {
    console.log('Crear nuevo producto');
    this.router.navigate(['/products/new']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
}
