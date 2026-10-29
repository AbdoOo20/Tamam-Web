import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'tamam-pagination',
  template: `
    @if (totalPages() > 1) {
      <nav class="d-flex flex-wrap align-items-center justify-content-between gap-2 p-3" aria-label="التنقل بين الصفحات">
        <small class="text-secondary">{{ totalCount() }} نتيجة · صفحة {{ page() }} من {{ totalPages() }}</small>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" [class.disabled]="page() <= 1">
            <button type="button" class="page-link" [disabled]="page() <= 1" (click)="go(page() - 1)">السابق</button>
          </li>
          @for (item of pages(); track $index) {
            @if (item === null) {
              <li class="page-item disabled"><span class="page-link">…</span></li>
            } @else {
              <li class="page-item" [class.active]="item === page()">
                <button
                  type="button"
                  class="page-link"
                  [attr.aria-current]="item === page() ? 'page' : null"
                  (click)="go(item)"
                >
                  {{ item }}
                </button>
              </li>
            }
          }
          <li class="page-item" [class.disabled]="page() >= totalPages()">
            <button type="button" class="page-link" [disabled]="page() >= totalPages()" (click)="go(page() + 1)">التالي</button>
          </li>
        </ul>
      </nav>
    }
  `,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalCount = input(0);
  readonly pageChange = output<number>();
  /** Page numbers around the current one; `null` is an ellipsis. */
  protected readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const result: (number | null)[] = [];

    for (let number = 1; number <= total; number++) {
      if (number === 1 || number === total || Math.abs(number - current) <= 1) {
        result.push(number);
      } else if (result[result.length - 1] !== null) {
        result.push(null);
      }
    }

    return result;
  });

  protected go(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.page()) {
      this.pageChange.emit(page);
    }
  }
}
