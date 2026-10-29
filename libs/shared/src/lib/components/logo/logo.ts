import { Component, input } from '@angular/core';

/** The Tamam mark (a check inside a rounded square) with the wordmark. */
@Component({
  selector: 'tamam-logo',
  template: `
    <span class="d-inline-flex align-items-center gap-2" [class.text-white]="light()">
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="16" [attr.fill]="light() ? '#ffffff' : '#07805f'" />
        <path
          d="M18 33.5l9.5 9.5L46 22"
          fill="none"
          [attr.stroke]="light() ? '#07805f' : '#ffffff'"
          stroke-width="7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      @if (!compact()) {
        <span class="fs-4 fw-bold lh-1">تمام</span>
      }
    </span>
  `,
})
export class Logo {
  /** White version for dark backgrounds. */
  readonly light = input(false);
  /** Only the mark, without the name. */
  readonly compact = input(false);
}
