import { Component, inject } from '@angular/core';

import { ConfirmService } from '../../services/confirm.service';
import { Modal } from '../modal/modal';

/** Render once in the app shell. */
@Component({
  selector: 'tamam-confirm-host',
  imports: [Modal],
  template: `
    @if (service.request(); as request) {
      <tamam-modal [title]="request.title" (closed)="service.answer(false)">
        <p class="mb-0">{{ request.message }}</p>

        <div modal-footer class="d-flex gap-2">
          <button type="button" class="btn btn-light" (click)="dismiss()">{{ request.cancelText }}</button>
          <button
            type="button"
            class="btn"
            [class.btn-danger]="request.tone === 'danger'"
            [class.btn-warning]="request.tone === 'warning'"
            [class.btn-primary]="request.tone === 'primary'"
            (click)="accept()"
          >
            {{ request.confirmText }}
          </button>
        </div>
      </tamam-modal>
    }
  `,
})
export class ConfirmHost {
  protected readonly service = inject(ConfirmService);

  protected accept(): void {
    this.service.answer(true);
  }

  protected dismiss(): void {
    this.service.answer(false);
  }
}
