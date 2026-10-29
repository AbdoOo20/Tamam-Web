import { Component, computed, input } from '@angular/core';

import { Tone } from '../../models/labels';

/** A small colored pill. `<tamam-badge tone="success" icon="bi-check">تم</tamam-badge>` */
@Component({
  selector: 'tamam-badge',
  template: `
    @if (icon()) {
      <i class="bi" [class]="icon()" aria-hidden="true"></i>
    }
    <ng-content />
  `,
  host: {
    class: 'badge rounded-pill border fw-semibold d-inline-flex align-items-center gap-1',
    '[class]': 'toneClass()',
  },
})
export class Badge {
  readonly tone = input<Tone>('secondary');
  readonly icon = input<string>();

  protected readonly toneClass = computed(
    () => `bg-${this.tone()}-subtle text-${this.tone()}-emphasis border-${this.tone()}-subtle`,
  );
}
