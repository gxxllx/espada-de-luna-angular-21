import { Component, computed, inject, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Category } from '@/app/core/models/category.models';
import { ProductCreateRequest } from '@/app/core/models/product.models';
import { CategoryService } from '@/app/core/services/category.service';
import { ProductService } from '@/app/core/services/product.service';
import { Button } from '@/app/shared/components/button/button';
import { Input } from '@/app/shared/components/input/input';
import { Router } from '@angular/router';

const optionalPositiveIntegerValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') return null;

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return { positiveInteger: true };
  }

  return null;
};

const nonNegativeIntegerValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return { required: true };
  }

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 0) {
    return { nonNegativeInteger: true };
  }

  return null;
};

const optionalUrlValidator = (control: AbstractControl): ValidationErrors | null => {
  const rawValue = control.value;
  const value = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!value) return null;
  if (value.length < 5) return { minlength: true };

  try {
    new URL(value);
    return null;
  } catch {
    return { invalidUrl: true };
  }
};

@Component({
  selector: 'app-new-product',
  standalone: true,
  imports: [ReactiveFormsModule, Button, Input],
  templateUrl: './new-product.html',
  styleUrl: './new-product.scss',
})
export class NewProduct {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);

  readonly closePanel = output<void>();
  readonly saved = output<void>();

  readonly categories = signal<Category[]>([]);
  readonly loadingCategories = signal<boolean>(true);
  readonly submitting = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly submitAttempted = signal<boolean>(false);

  readonly productForm = this.fb.group({
    product_name: ['', [Validators.required, Validators.minLength(3)]],
    product_description: [''],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    image_url: ['', [optionalUrlValidator]],
    category_id: [null as number | null, [Validators.required, Validators.min(1)]],
    volume_cm3: [null as number | null, [optionalPositiveIntegerValidator]],
    weight_g: [null as number | null, [optionalPositiveIntegerValidator]],
    variants: this.fb.array([this.createVariantGroup()]),
    images: this.fb.array([this.createImageGroup()]),
  });

  readonly hasInvalidCollections = computed(() => {
    return this.variantsArray.length === 0 || this.imagesArray.length === 0;
  });

  private readonly fieldErrorMessages: Record<string, Record<string, string>> = {
    product_name: {
      required: 'El nombre es obligatorio',
      minlength: 'Minimo 3 caracteres',
    },
    price: {
      required: 'El precio es obligatorio',
      min: 'El precio debe ser mayor que 0',
    },
    category_id: {
      required: 'La categoria es obligatoria',
      min: 'La categoria debe ser un entero positivo',
    },
    image_url: {
      minlength: 'La URL debe tener al menos 5 caracteres',
      invalidUrl: 'La imagen principal debe ser una URL valida',
    },
    volume_cm3: {
      positiveInteger: 'El volumen debe ser un entero positivo',
    },
    weight_g: {
      positiveInteger: 'El peso debe ser un entero positivo',
    },
  };

  private readonly variantErrorMessages: Record<string, string> = {
    required: 'Campo obligatorio',
    min: 'Debe ser mayor o igual que 0',
    positiveInteger: 'Debe ser un entero positivo',
    nonNegativeInteger: 'Debe ser un entero mayor o igual que 0',
  };

  private readonly imageErrorMessages: Record<string, string> = {
    required: 'Campo obligatorio',
    positiveInteger: 'Debe ser un entero positivo',
    nonNegativeInteger: 'Debe ser un entero mayor o igual que 0',
    min: 'Debe ser mayor o igual que 0',
  };

  constructor() {
    this.loadCategories();
  }

  get variantsArray(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  get imagesArray(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  addVariant(): void {
    this.variantsArray.push(this.createVariantGroup());
  }

  removeVariant(index: number): void {
    if (this.variantsArray.length === 1) return;
    this.variantsArray.removeAt(index);
  }

  addImage(): void {
    this.imagesArray.push(this.createImageGroup(this.imagesArray.length));
  }

  removeImage(index: number): void {
    if (this.imagesArray.length === 1) return;
    this.imagesArray.removeAt(index);
    this.reindexImages();
  }

  onCancel(): void {
    this.closePanel.emit();
    this.router.navigate(['/products']);
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.submitAttempted.set(true);

    if (this.productForm.invalid || this.hasInvalidCollections()) {
      this.productForm.markAllAsTouched();
      this.errorMessage.set('Completa los campos obligatorios antes de guardar.');
      return;
    }

    const rawValue = this.productForm.getRawValue();
    const payload: ProductCreateRequest = {
      product_name: (rawValue.product_name ?? '').trim(),
      product_description: this.normalizeText(rawValue.product_description),
      price: Number(rawValue.price),
      image_url: this.normalizeText(rawValue.image_url),
      category_id: Number(rawValue.category_id),
      volume_cm3: this.normalizeNumber(rawValue.volume_cm3),
      weight_g: this.normalizeNumber(rawValue.weight_g),
      variants: rawValue.variants.map((variant) => ({
        color_id: this.normalizeNumber(variant.color_id),
        size_id: this.normalizeNumber(variant.size_id),
        stock: Number(variant.stock),
      })),
      images: rawValue.images.map((image, index) => ({
        color_id: this.normalizeNumber(image.color_id),
        name: (image.name ?? '').trim(),
        order_index: Number(image.order_index ?? index),
      })),
    };

    this.submitting.set(true);

    this.productService.createProduct(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitAttempted.set(false);
        this.resetForm();
        this.saved.emit();
        this.router.navigate(['/products']);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo crear el producto.');
      },
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.productForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitAttempted());
  }

  getFieldError(controlName: string): string {
    const control = this.productForm.get(controlName);
    const messages = this.fieldErrorMessages[controlName] ?? {};
    return this.resolveErrorMessage(control, messages);
  }

  isVariantFieldInvalid(index: number, controlName: string): boolean {
    const control = this.variantsArray.at(index)?.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitAttempted());
  }

  getVariantFieldError(index: number, controlName: string): string {
    const control = this.variantsArray.at(index)?.get(controlName);
    return this.resolveErrorMessage(control, this.variantErrorMessages);
  }

  isImageFieldInvalid(index: number, controlName: string): boolean {
    const control = this.imagesArray.at(index)?.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitAttempted());
  }

  getImageFieldError(index: number, controlName: string): string {
    const control = this.imagesArray.at(index)?.get(controlName);
    if (controlName === 'name') {
      return this.resolveErrorMessage(control, {
        ...this.imageErrorMessages,
        required: 'La imagen es obligatoria',
      });
    }

    return this.resolveErrorMessage(control, this.imageErrorMessages);
  }

  private createVariantGroup() {
    return this.fb.group({
      color_id: [null as number | null, [optionalPositiveIntegerValidator]],
      size_id: [null as number | null, [optionalPositiveIntegerValidator]],
      stock: [0, [Validators.required, Validators.min(0), nonNegativeIntegerValidator]],
    });
  }

  private createImageGroup(orderIndex: number = 0) {
    return this.fb.group({
      color_id: [null as number | null, [optionalPositiveIntegerValidator]],
      name: ['', Validators.required],
      order_index: [
        orderIndex,
        [Validators.required, Validators.min(0), nonNegativeIntegerValidator],
      ],
    });
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.loadingCategories.set(false);
      },
      error: () => {
        this.categories.set([]);
        this.loadingCategories.set(false);
        this.errorMessage.set('No se pudieron cargar las categorias.');
      },
    });
  }

  private normalizeText(value: string | null | undefined): string | undefined {
    const normalized = value?.trim();
    return normalized || undefined;
  }

  private normalizeNumber(value: number | string | null | undefined): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? undefined : numericValue;
  }

  private resolveErrorMessage(
    control: AbstractControl | null | undefined,
    messages: Record<string, string>,
  ): string {
    if (!control?.errors) return '';

    for (const errorKey of Object.keys(messages)) {
      if (control.hasError(errorKey)) {
        return messages[errorKey];
      }
    }

    return 'Valor invalido';
  }

  private resetForm(): void {
    this.productForm.reset({
      product_name: '',
      product_description: '',
      price: null,
      image_url: '',
      category_id: null,
      volume_cm3: null,
      weight_g: null,
    });

    while (this.variantsArray.length > 0) {
      this.variantsArray.removeAt(0);
    }

    while (this.imagesArray.length > 0) {
      this.imagesArray.removeAt(0);
    }

    this.variantsArray.push(this.createVariantGroup());
    this.imagesArray.push(this.createImageGroup());
    this.errorMessage.set('');
  }

  private reindexImages(): void {
    this.imagesArray.controls.forEach((control, index) => {
      control.get('order_index')?.setValue(index);
    });
  }
}
