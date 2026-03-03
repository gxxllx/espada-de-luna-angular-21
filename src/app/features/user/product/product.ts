import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
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

  product = signal<ProductModel | null>(null);
  variants = signal<ProductVariant[]>([]);

  selectedColorId = signal<number | null>(null);
  selectedSizeId = signal<number | null>(null);

  uniqueColors = computed(() => {
    const seen = new Set<number>();
    return this.variants().filter((v) => {
      if (seen.has(v.color_id)) return false;
      seen.add(v.color_id);
      return true;
    });
  });

  uniqueSizes = computed(() => {
    const seen = new Set<number>();
    return this.variants().filter((v) => {
      if (seen.has(v.size_id)) return false;
      seen.add(v.size_id);
      return true;
    });
  });

  activeVariant = computed(() => {
    const colorId = this.selectedColorId();
    const sizeId = this.selectedSizeId();
    if (colorId === null || sizeId === null) return null;
    return this.variants().find((v) => v.color_id === colorId && v.size_id === sizeId) ?? null;
  });

  activePrice = computed(() => {
    const variant = this.activeVariant();
    if (!variant) return this.product()?.price ?? 0;
    return variant.sale_price ?? this.product()?.price ?? 0;
  });

  hasSale = computed(() => {
    const variant = this.activeVariant();
    return variant?.sale_price != null && variant.sale_price < (this.product()?.price ?? 0);
  });

  constructor() {
    effect(() => {
      const productSlug = this.slug();
      if (productSlug) {
        this.loadProduct(productSlug);
      }
    });
  }

  selectColor(colorId: number): void {
    this.selectedColorId.set(colorId);
  }

  selectSize(sizeId: number): void {
    this.selectedSizeId.set(sizeId);
  }

  private loadProduct(slug: string): void {
    this.productService.getBySlug(slug).subscribe({
      next: (response) => {
        this.product.set(response.data.product);
        this.variants.set(response.data.variants);

        // Auto-select first color and size
        const variants = response.data.variants;
        if (variants.length > 0) {
          this.selectedColorId.set(variants[0].color_id);
          this.selectedSizeId.set(variants[0].size_id);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
