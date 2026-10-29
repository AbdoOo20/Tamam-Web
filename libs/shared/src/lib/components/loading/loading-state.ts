import { Component, computed, input, numberAttribute } from '@angular/core';

/**
 * Loading indicator.
 * - `spinner` (default): a centered spinner with a label.
 * - `skeleton`: grey placeholder lines, good for tables and cards.
 * - `inline`: a small spinner for buttons or headers.
 */
@Component({
  selector: 'tamam-loading',
  template: `
    @switch (variant()) {
      @case ('skeleton') {
        <div class="placeholder-glow" role="status" aria-live="polite">
          <span class="visually-hidden">{{ label() }}</span>
          @for (row of rowList(); track row) {
            <span class="placeholder col-12 rounded mb-3 d-block" style="height: 1.1rem"></span>
          }
        </div>
      }
      @case ('inline') {
        <span class="d-inline-flex align-items-center gap-2 text-secondary" role="status">
          <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
          <span>{{ label() }}</span>
        </span>
      }
      @default {
        <div class="d-flex flex-column align-items-center gap-3 py-5 text-secondary" role="status">
          <span class="spinner-border text-primary" aria-hidden="true"></span>
          <span>{{ label() }}</span>
        </div>
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }

    :host([variant='inline']) {
      display: inline-block;
    }
  `,
  host: { '[attr.variant]': 'variant()' },
})
export class LoadingState {
  readonly variant = input<'spinner' | 'skeleton' | 'inline'>('spinner');
  readonly label = input('جارٍ التحميل...');
  readonly rows = input(5, { transform: numberAttribute });
  protected readonly rowList = computed(() => Array.from({ length: this.rows() }, (_, i) => i));
}
