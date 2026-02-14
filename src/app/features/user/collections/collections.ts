import { Component, inject, input, effect, signal } from '@angular/core';
import { ProductService } from '@/app/core/services/product.service';
import { Product as ProductModel } from '@/app/core/models/product.models';

@Component({
  selector: 'app-collections',
  imports: [],
  templateUrl: './collections.html',
  styleUrls: ['./collections.scss'],
})
export class Collections {
  private readonly productService = inject(ProductService);

  category = input.required<string | null>();
  productFromCategory = signal<ProductModel[]>([]);

  constructor() {
    effect(() => {
      const category = this.category();
      if (category) {
        this.loadProductsByCategory(category);
      }
    });
  }

  private loadProductsByCategory(category: string | null): void {
    if (category === 'all') {
      this.productService.getAll().subscribe({
        next: (response) => {
          this.productFromCategory.set(response.data);
        },
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      // this.productService.getByCategory(category).subscribe({
      //   next: (response) => {
      //     this.productFromCategory.set(response.data);
      //   },
      //   error: (err) => {
      //     console.error(err);
      //   },
      // });
    }
  }
}
