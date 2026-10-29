import { Component, inject } from '@angular/core';
import { ToastService } from '@tamam/core';

@Component({
  selector: 'tamam-toast-host',
  template: `
    <div class="toast-container position-fixed bottom-0 start-0 p-3" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast show align-items-center border-0 mb-2 text-white"
          [class.bg-success]="toast.kind === 'success'"
          [class.bg-danger]="toast.kind === 'error'"
          [class.bg-dark]="toast.kind === 'info'"
          role="status"
        >
          <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-2">
              <i
                class="bi"
                [class.bi-check-circle-fill]="toast.kind === 'success'"
                [class.bi-exclamation-octagon-fill]="toast.kind === 'error'"
                [class.bi-info-circle-fill]="toast.kind === 'info'"
                aria-hidden="true"
              ></i>
              <span>{{ toast.message }}</span>
            </div>
            <button
              type="button"
              class="btn-close btn-close-white ms-2 me-auto m-auto"
              aria-label="إغلاق"
              (click)="toastService.dismiss(toast.id)"
            ></button>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-container {
      z-index: 2100;
    }
  `,
})
export class ToastHost {
  protected readonly toastService = inject(ToastService);
}
