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
import {
  Product as ProductModel,
  ProductImage,
  ProductVariant,
} from '@/app/core/models/product.models';

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
  images = signal<ProductImage[]>([]);

  selectedImageIndex = signal(0);
  zoomActive = signal(false);
  zoomOriginX = signal(50);
  zoomOriginY = signal(50);

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

  galleryImages = computed(() => {
    const allImages = this.images();
    const selectedColorId = this.selectedColorId();

    const getColorId = (image: ProductImage): number | null => {
      if (image.color_id === null || image.color_id === undefined) return null;
      const normalized = Number(image.color_id);
      return Number.isFinite(normalized) ? normalized : null;
    };

    const withSource = allImages
      .map((image) => ({
        colorId: getColorId(image),
        order: image.order_index ?? Number.MAX_SAFE_INTEGER,
        src: image.image_url ?? image.url ?? image.path ?? image.name ?? image.key ?? null,
      }))
      .filter((image) => !!image.src);

    const colorMatched =
      selectedColorId === null
        ? []
        : withSource.filter((image) => image.colorId === selectedColorId);

    const noColorImages = withSource.filter((image) => image.colorId === null);
    const resolved = colorMatched.length > 0 ? colorMatched : noColorImages;

    const sorted = [...resolved].sort((a, b) => a.order - b.order);
    const srcs = sorted.map((image) => image.src as string);

    if (srcs.length > 0) return srcs;

    const fallback = this.product()?.image_url;
    return fallback ? [fallback] : [];
  });

  activeImageSrc = computed(() => {
    const images = this.galleryImages();
    if (images.length === 0) return '';

    const index = this.selectedImageIndex();
    const safeIndex = Math.min(Math.max(index, 0), images.length - 1);
    return images[safeIndex];
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

    effect(() => {
      const images = this.galleryImages();
      const current = this.selectedImageIndex();
      if (images.length === 0) {
        this.selectedImageIndex.set(0);
        return;
      }

      if (current > images.length - 1) {
        this.selectedImageIndex.set(0);
      }
    });
  }

  selectColor(colorId: number): void {
    this.selectedColorId.set(colorId);

    const firstVariantForColor = this.variants().find((v) => v.color_id === colorId);
    if (firstVariantForColor) {
      this.selectedSizeId.set(firstVariantForColor.size_id);
    }

    this.selectedImageIndex.set(0);
  }

  selectSize(sizeId: number): void {
    this.selectedSizeId.set(sizeId);
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  onMainImageMouseMove(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.zoomOriginX.set(Math.min(100, Math.max(0, x)));
    this.zoomOriginY.set(Math.min(100, Math.max(0, y)));
    this.zoomActive.set(true);
  }

  onMainImageMouseLeave(): void {
    this.zoomActive.set(false);
    this.zoomOriginX.set(50);
    this.zoomOriginY.set(50);
  }

  private loadProduct(slug: string): void {
    this.productService.getBySlug(slug).subscribe({
      next: (response) => {
        const product = response.data.product ?? null;
        const variants = response.data.variants ?? [];
        const images = response.data.images ?? [];

        this.product.set(product);
        this.variants.set(variants);
        this.images.set(images);
        this.selectedImageIndex.set(0);
        this.zoomActive.set(false);

        // Auto-select first color and size
        if (variants.length > 0) {
          this.selectedColorId.set(variants[0].color_id);
          this.selectedSizeId.set(variants[0].size_id);
        } else {
          this.selectedColorId.set(null);
          this.selectedSizeId.set(null);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
