import { Component, computed, input, output } from '@angular/core';
import { Pagination } from '@/app/shared/components/pagination/pagination';

export type TableCellType = 'text' | 'image' | 'actions';
export type TableAlign = 'left' | 'center' | 'right';

export interface TableRowAction<T = unknown> {
  label: string;
  tone?: 'default' | 'danger';
  disabled?: (row: T) => boolean;
  onClick: (row: T) => void;
}

export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  cellType?: TableCellType;
  value?: (row: T) => unknown;
  className?: string;
  align?: TableAlign;
  placeholder?: string;
  altText?: (row: T) => string;
  actions?: TableRowAction<T>[];
}

@Component({
  selector: 'app-table',
  imports: [Pagination],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class SharedTable {
  columns = input.required<readonly TableColumn<any>[]>();
  rows = input<readonly any[]>([]);
  rowTrackBy = input<(index: number, row: any) => string | number>((index) => index);

  loading = input<boolean>(false);
  loadingMessage = input<string>('Cargando datos...');
  emptyMessage = input<string>('No hay elementos en esta pagina.');

  currentPage = input<number>(1);
  totalPages = input<number>(1);
  totalItems = input<number>(0);
  itemsPerPage = input<number>(20);
  disabled = input<boolean>(false);
  itemLabel = input<string>('elementos');

  pageChange = output<number>();

  readonly columnCount = computed(() => Math.max(this.columns().length, 1));

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  resolveCellType(column: TableColumn<any>): TableCellType {
    return column.cellType ?? 'text';
  }

  getCellValue(row: any, column: TableColumn<any>): unknown {
    if (column.value) return column.value(row);
    return row?.[column.key];
  }

  getCellText(row: any, column: TableColumn<any>): string {
    const value = this.getCellValue(row, column);
    return value === null || value === undefined || value === '' ? '-' : String(value);
  }

  getAltText(row: any, column: TableColumn<any>): string {
    if (column.altText) return column.altText(row);
    return 'Vista del elemento';
  }

  getImageSrc(row: any, column: TableColumn<any>): string | null {
    const value = this.getCellValue(row, column);
    if (value === null || value === undefined || value === '') return null;
    return String(value);
  }

  getActions(column: TableColumn<any>): readonly TableRowAction<any>[] {
    return column.actions ?? [];
  }

  isActionDisabled(action: TableRowAction<any>, row: any): boolean {
    if (this.disabled()) return true;
    if (!action.disabled) return false;
    return action.disabled(row);
  }

  onActionClick(action: TableRowAction<any>, row: any): void {
    if (this.isActionDisabled(action, row)) return;
    action.onClick(row);
  }
}
