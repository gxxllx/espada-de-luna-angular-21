import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductAdmin } from '@/app/core/models/product.models';
import { ProductService } from '@/app/core/services/product.service';
import { Button } from '@/app/shared/components/button/button';
import { SharedTable, TableColumn } from '@/app/shared/components/table/table';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [Button, SharedTable],
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

  readonly tableColumns: TableColumn<ProductAdmin>[] = [
    { key: 'id', header: 'ID' },
    {
      key: 'image_url',
      header: 'Imagen',
      cellType: 'image',
      placeholder: 'Sin imagen',
      altText: (product) => `Producto ${product.product_name}`,
    },
    {
      key: 'product_name',
      header: 'Nombre',
      className: 'products-table__name',
    },
    {
      key: 'price',
      header: 'Precio',
      value: (product) => `${this.formatPrice(product.price)} EUR`,
    },
    { key: 'category_name', header: 'Categoria' },
    { key: 'total_stock', header: 'Stock total' },
    { key: 'total_variants', header: 'Variantes' },
    {
      key: 'total_items',
      header: 'Total items',
      value: (product) => product.total_items ?? product.total_stock,
    },
    {
      key: 'actions',
      header: 'Acciones',
      cellType: 'actions',
      actions: [
        {
          label: 'Editar',
          onClick: (product) => this.editProduct(product.id),
        },
        {
          label: 'Eliminar',
          tone: 'danger',
          onClick: (product) => this.deleteProduct(product.id),
        },
      ],
    },
  ];

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

  trackByProduct(_: number, product: ProductAdmin): number {
    return product.id;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
}
