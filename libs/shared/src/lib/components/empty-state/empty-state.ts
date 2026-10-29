import { Component, input } from '@angular/core';

/** Shown when a list or page has no data. Put action buttons inside the tag. */
@Component({
  selector: 'tamam-empty-state',
  template: `
    <div class="empty text-center mx-auto">
      <span class="tm-icon-box mb-3" aria-hidden="true"><i class="bi" [class]="icon()"></i></span>
      <h2 class="h5 fw-bold mb-2">{{ title() }}</h2>
      @if (description()) {
        <p class="text-secondary mb-3">{{ description() }}</p>
      }
      <div class="d-flex flex-wrap justify-content-center gap-2">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 2.5rem 1rem;
    }

    .empty {
      max-width: 26rem;
    }

    .tm-icon-box {
      width: 4rem;
      height: 4rem;
      font-size: 1.75rem;
      border-radius: 18px;
    }
  `,
})
export class EmptyState {
  readonly icon = input('bi-inbox');
  readonly title = input.required<string>();
  readonly description = input<string>();
}
