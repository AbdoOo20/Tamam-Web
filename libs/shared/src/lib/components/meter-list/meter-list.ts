import { Component, computed, input } from '@angular/core';

import { Tone } from '../../models/labels';

export interface MeterItem {
  label: string;
  value: number;
  tone?: Tone;
}

/** Horizontal bars showing how a total splits into parts. Good for distributions. */
@Component({
  selector: 'tamam-meter-list',
  template: `
    <ul class="list-unstyled mb-0 d-grid gap-3">
      @for (row of rows(); track row.label) {
        <li>
          <div class="d-flex justify-content-between small mb-1">
            <span class="fw-semibold">{{ row.label }}</span>
            <span class="text-secondary">{{ row.value }} · {{ row.percent }}%</span>
          </div>
          <div
            class="progress"
            style="height: 0.6rem"
            role="progressbar"
            [attr.aria-label]="row.label"
            [attr.aria-valuenow]="row.percent"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="progress-bar" [class]="'bg-' + row.tone" [style.width.%]="row.percent"></div>
          </div>
        </li>
      }
    </ul>
  `,
})
export class MeterList {
  readonly items = input.required<readonly MeterItem[]>();

  protected readonly rows = computed(() => {
    const items = this.items();
    const total = items.reduce((sum, item) => sum + item.value, 0);

    return items.map((item) => ({
      label: item.label,
      value: item.value,
      tone: item.tone ?? 'primary',
      percent: total === 0 ? 0 : Math.round((item.value / total) * 100),
    }));
  });
}
