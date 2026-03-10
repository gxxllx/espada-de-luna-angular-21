import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  currentPage = input<number>(1);
  totalPages = input<number>(1);
  totalItems = input<number>(0);
  itemsPerPage = input<number>(20);
  disabled = input<boolean>(false);

  pageChange = output<number>();

  readonly visiblePages = computed(() => {
    const totalPages = Math.max(this.totalPages(), 1);
    const currentPage = Math.min(Math.max(this.currentPage(), 1), totalPages);
    const maxVisible = 5;

    let start = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
    let end = Math.min(start + maxVisible - 1, totalPages);

    if (end - start + 1 < maxVisible) {
      start = Math.max(end - maxVisible + 1, 1);
    }

    const pages: number[] = [];
    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    return pages;
  });

  goToPreviousPage(): void {
    if (this.disabled() || this.currentPage() <= 1) return;
    this.pageChange.emit(this.currentPage() - 1);
  }

  goToNextPage(): void {
    if (this.disabled() || this.currentPage() >= this.totalPages()) return;
    this.pageChange.emit(this.currentPage() + 1);
  }

  goToPage(page: number): void {
    if (this.disabled()) return;
    if (page < 1 || page > this.totalPages()) return;
    if (page === this.currentPage()) return;

    this.pageChange.emit(page);
  }
}
