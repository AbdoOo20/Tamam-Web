import { Component, input } from '@angular/core';

/** Title row of a page. Content inside the tag appears on the opposite side (buttons). */
@Component({
  selector: 'tamam-page-header',
  template: `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="h3 fw-bold mb-1">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="text-secondary mb-0">{{ subtitle() }}</p>
        }
      </div>
      <div class="d-flex flex-wrap gap-2">
        <ng-content />
      </div>
    </div>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
