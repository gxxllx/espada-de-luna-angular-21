import { Component, ChangeDetectionStrategy, effect, inject, input, signal } from '@angular/core';
import { ProductService } from '@/app/core/services/product.service';
import { Product as ProductModel, ProductVariant } from '@/app/core/models/product.models';

@Component({
  selector: 'app-product',
  imports: [],
  templateUrl: './product.html',
  styleUrls: ['./product.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Product {
  private readonly productService = inject(ProductService);
  slug = input.required<string>();
  selectedVariantIndex = signal<number>(0);

  product = signal<ProductModel | null>(null);
  variants = signal<ProductVariant[]>([]);

  constructor() {
    effect(() => {
      const productSlug = this.slug();
      if (productSlug) {
        this.loadProduct(productSlug);
      }
    });
  }

  private loadProduct(slug: string): void {
    this.productService.getBySlug(slug).subscribe({
      next: (response) => {
        this.product.set(response.data.product);
        this.variants.set(response.data.variants);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
