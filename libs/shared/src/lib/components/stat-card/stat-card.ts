import { Component, input } from '@angular/core';

import { Tone } from '../../models/labels';

/** A number with a label and an icon, used on dashboards. */
@Component({
  selector: 'tamam-stat-card',
  template: `
    <div class="tm-card h-100 p-3 d-flex align-items-center gap-3">
      <span class="tm-icon-box flex-shrink-0" [class]="'tone-' + tone()" aria-hidden="true">
        <i class="bi" [class]="icon()"></i>
      </span>
      <div class="min-w-0">
        <div class="text-secondary small fw-semibold">{{ label() }}</div>
        <div class="fs-4 fw-bold lh-sm">{{ value() }}</div>
        @if (hint()) {
          <div class="text-secondary small">{{ hint() }}</div>
        }
      </div>
    </div>
  `,
  styles: `
    .min-w-0 {
      min-width: 0;
    }

    .tone-danger {
      background: var(--bs-danger-bg-subtle);
      color: var(--bs-danger-text-emphasis);
    }

    .tone-warning {
      background: var(--bs-warning-bg-subtle);
      color: var(--bs-warning-text-emphasis);
    }

    .tone-info {
      background: var(--bs-info-bg-subtle);
      color: var(--bs-info-text-emphasis);
    }

    .tone-success {
      background: var(--bs-success-bg-subtle);
      color: var(--bs-success-text-emphasis);
    }
  `,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input('bi-graph-up');
  readonly tone = input<Tone>('primary');
  readonly hint = input<string>();
}
