import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Input } from '@/app/shared/components/input/input';

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

type ImageInsertMode = 'append' | 'replace-target';

@Component({
  selector: 'app-product-images-form',
  standalone: true,
  imports: [ReactiveFormsModule, Input],
  templateUrl: './product-images-form.html',
  styleUrl: './product-images-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImagesForm implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  readonly imagesArray = input.required<FormArray<FormGroup>>();
  readonly submitAttempted = input<boolean>(false);

  readonly isScreenFileDragActive = signal<boolean>(false);
  readonly imageInsertDialogOpen = signal<boolean>(false);
  readonly pendingInsertTargetIndex = signal<number | null>(null);
  readonly pendingInsertCount = signal<number>(0);
  readonly imageFormatError = signal<string>('');

  private readonly imagePreviewUrls = signal<(string | null)[]>([null]);
  private pendingImageFiles: File[] = [];
  private externalDragCounter = 0;

  private readonly imageErrorMessages: Record<string, string> = {
    required: 'Campo obligatorio',
    positiveInteger: 'Debe ser un entero positivo',
    nonNegativeInteger: 'Debe ser un entero mayor o igual que 0',
    min: 'Debe ser mayor o igual que 0',
  };

  ngOnDestroy(): void {
    this.revokeAllPreviewUrls();
  }

  addImage(): void {
    this.imagesArray().push(this.createImageGroup());
    this.imagePreviewUrls.update((previews) => [...previews, null]);
    this.reindexImagesByColor();
  }

  removeImage(index: number): void {
    if (this.imagesArray().length === 1) return;
    this.revokePreviewAt(index);
    this.imagesArray().removeAt(index);
    this.imagePreviewUrls.update((previews) => previews.filter((_, i) => i !== index));
    this.reindexImagesByColor();
  }

  moveImageUp(index: number): void {
    if (!this.canMoveImageUp(index)) return;
    this.moveImage(index, index - 1);
  }

  moveImageDown(index: number): void {
    if (!this.canMoveImageDown(index)) return;
    this.moveImage(index, index + 1);
  }

  canMoveImageUp(index: number): boolean {
    if (index <= 0) return false;
    return this.getImageGroupKey(index) === this.getImageGroupKey(index - 1);
  }

  canMoveImageDown(index: number): boolean {
    if (index >= this.imagesArray().length - 1) return false;
    return this.getImageGroupKey(index) === this.getImageGroupKey(index + 1);
  }

  hasGroupSeparator(index: number): boolean {
    if (index === 0) return false;
    return this.getImageGroupKey(index) !== this.getImageGroupKey(index - 1);
  }

  onImageFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = this.filterWebpFiles(Array.from(input.files ?? []));
    if (!files.length) {
      input.value = '';
      return;
    }

    this.openImageInsertDialog(files, null);
    input.value = '';
  }

  onImageRowDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    this.applyCopyDropEffect(event);
  }

  onImageRowDrop(index: number, event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;

    event.preventDefault();
    event.stopPropagation();

    const files = this.filterWebpFiles(Array.from(event.dataTransfer.files ?? []));

    if (!files.length) {
      this.resetExternalDragState();
      return;
    }

    this.openImageInsertDialog(files, index);
  }

  onScreenDragEnter(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;
    this.externalDragCounter += 1;
    this.isScreenFileDragActive.set(true);
  }

  onScreenDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    this.isScreenFileDragActive.set(true);
    this.applyCopyDropEffect(event);
  }

  onScreenDragLeave(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;
    this.externalDragCounter = Math.max(0, this.externalDragCounter - 1);
    if (this.externalDragCounter === 0) {
      this.isScreenFileDragActive.set(false);
    }
  }

  onScreenDrop(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;

    event.preventDefault();
    const files = this.filterWebpFiles(Array.from(event.dataTransfer.files ?? []));

    if (files.length) {
      this.openImageInsertDialog(files, null);
    }

    this.resetExternalDragState();
  }

  closeImageInsertDialog(): void {
    this.pendingImageFiles = [];
    this.pendingInsertCount.set(0);
    this.pendingInsertTargetIndex.set(null);
    this.imageInsertDialogOpen.set(false);
    this.imageFormatError.set('');
    this.resetExternalDragState();
  }

  confirmImageInsert(mode: ImageInsertMode): void {
    if (!this.pendingImageFiles.length) {
      this.closeImageInsertDialog();
      return;
    }

    const files = [...this.pendingImageFiles];
    const targetIndex = this.pendingInsertTargetIndex();

    if (mode === 'replace-target' && targetIndex !== null) {
      this.replaceImageAtIndex(targetIndex, files[0]);
      if (files.length > 1) {
        this.insertImageFilesAt(targetIndex + 1, files.slice(1));
      }
      this.reindexImagesByColor();
      this.closeImageInsertDialog();
      return;
    }

    this.addImageFiles(files);
    this.closeImageInsertDialog();
  }

  getImagePreview(index: number): string | null {
    const preview = this.imagePreviewUrls()[index];
    if (preview) return preview;

    const rawName = this.imagesArray().at(index)?.get('name')?.value;
    const value = typeof rawName === 'string' ? rawName.trim() : '';
    if (!value) return null;

    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
      return value;
    }

    return null;
  }

  getImageOrderLabel(index: number): number {
    const key = this.getImageGroupKey(index);
    let order = 0;

    for (let i = 0; i <= index; i++) {
      if (this.getImageGroupKey(i) === key) {
        order += 1;
      }
    }

    return order;
  }

  getImageGroupLabel(index: number): string {
    const colorId = this.normalizeNumber(this.imagesArray().at(index)?.get('color_id')?.value);
    return colorId === undefined ? 'Sin color' : `Color ${colorId}`;
  }

  isImageFieldInvalid(index: number, controlName: string): boolean {
    const control = this.imagesArray().at(index)?.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitAttempted());
  }

  getImageFieldError(index: number, controlName: string): string {
    const control = this.imagesArray().at(index)?.get(controlName);
    if (controlName === 'name') {
      return this.resolveErrorMessage(control, {
        ...this.imageErrorMessages,
        required: 'La imagen es obligatoria',
      });
    }

    return this.resolveErrorMessage(control, this.imageErrorMessages);
  }

  private createImageGroup(orderIndex: number = 0) {
    return this.fb.group({
      color_id: [null as number | null, [optionalPositiveIntegerValidator]],
      name: ['', Validators.required],
      type: ['image/webp', Validators.required],
      file: [null as File | null],
      order_index: [
        orderIndex,
        [Validators.required, Validators.min(0), nonNegativeIntegerValidator],
      ],
    });
  }

  private openImageInsertDialog(files: File[], targetIndex: number | null): void {
    this.pendingImageFiles = files;
    this.pendingInsertCount.set(files.length);
    this.pendingInsertTargetIndex.set(targetIndex);
    this.imageInsertDialogOpen.set(true);
    this.isScreenFileDragActive.set(false);
  }

  private addImageFiles(files: File[]): void {
    if (!files.length) return;

    let startIndex = 0;

    if (this.imagesArray().length === 1 && this.isImageRowEmpty(0)) {
      this.setImageAtIndex(0, files[0]);
      startIndex = 1;
    }

    for (let i = startIndex; i < files.length; i++) {
      this.imagesArray().push(this.createImageGroup());
      this.imagePreviewUrls.update((previews) => [...previews, null]);
      this.setImageAtIndex(this.imagesArray().length - 1, files[i]);
    }

    this.reindexImagesByColor();
  }

  private insertImageFilesAt(startIndex: number, files: File[]): void {
    let insertAt = startIndex;

    for (const file of files) {
      this.imagesArray().insert(insertAt, this.createImageGroup());
      this.imagePreviewUrls.update((previews) => {
        const next = [...previews];
        next.splice(insertAt, 0, null);
        return next;
      });
      this.setImageAtIndex(insertAt, file);
      insertAt += 1;
    }
  }

  private replaceImageAtIndex(index: number, file: File): void {
    this.setImageAtIndex(index, file);
  }

  private setImageAtIndex(index: number, file: File): void {
    this.imagesArray().at(index).patchValue({
      name: file.name,
      type: 'image/webp',
      file,
    });
    const objectUrl = URL.createObjectURL(file);

    this.imagePreviewUrls.update((previews) => {
      const next = [...previews];
      const previousPreview = next[index];
      if (previousPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(previousPreview);
      }
      next[index] = objectUrl;
      return next;
    });
  }

  private moveImage(sourceIndex: number, targetIndex: number): void {
    if (
      sourceIndex < 0 ||
      targetIndex < 0 ||
      sourceIndex >= this.imagesArray().length ||
      targetIndex >= this.imagesArray().length
    ) {
      return;
    }

    const movingControl = this.imagesArray().at(sourceIndex);
    this.imagesArray().removeAt(sourceIndex);
    this.imagesArray().insert(targetIndex, movingControl);

    this.imagePreviewUrls.update((previews) => {
      const next = [...previews];
      const [movingPreview] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, movingPreview ?? null);
      return next;
    });

    this.reindexImagesByColor();
  }

  private isImageRowEmpty(index: number): boolean {
    const row = this.imagesArray().at(index);
    const nameValue = row?.get('name')?.value;
    const colorValue = row?.get('color_id')?.value;

    return !nameValue && (colorValue === null || colorValue === undefined || colorValue === '');
  }

  private getImageGroupKey(index: number): string {
    const colorId = this.normalizeNumber(this.imagesArray().at(index)?.get('color_id')?.value);
    return colorId === undefined ? 'none' : String(colorId);
  }

  private reindexImagesByColor(): void {
    const groupCounters = new Map<string, number>();

    this.imagesArray().controls.forEach((control, index) => {
      const groupKey = this.getImageGroupKey(index);
      const currentOrder = groupCounters.get(groupKey) ?? 0;
      control.get('order_index')?.setValue(currentOrder, { emitEvent: false });
      groupCounters.set(groupKey, currentOrder + 1);
    });
  }

  private resetExternalDragState(): void {
    this.externalDragCounter = 0;
    this.isScreenFileDragActive.set(false);
  }

  private applyCopyDropEffect(event: DragEvent): void {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  private filterWebpFiles(files: File[]): File[] {
    const webpFiles = files.filter((file) => this.isWebpFile(file));
    if (!webpFiles.length && files.length) {
      this.imageFormatError.set('Solo se permiten imagenes WEBP (.webp).');
    } else {
      this.imageFormatError.set('');
    }
    return webpFiles;
  }

  private isWebpFile(file: File): boolean {
    return file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
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

  private revokePreviewAt(index: number): void {
    const preview = this.imagePreviewUrls()[index];
    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  }

  private revokeAllPreviewUrls(): void {
    for (const preview of this.imagePreviewUrls()) {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    }
  }
}
