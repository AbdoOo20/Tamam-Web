import { Component, inject } from '@angular/core';
import { ToastService } from '@tamam/core';

@Component({
  selector: 'tamam-toast-host',
  template: `
    <div class="toasts" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          role="status"
          [class.toast--error]="toast.kind === 'error'"
          [class.toast--success]="toast.kind === 'success'"
        >
          <span>{{ toast.message }}</span>
          <button type="button" aria-label="إغلاق" (click)="toastService.dismiss(toast.id)">
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed;
      inset-block-end: 1rem;
      inset-inline-start: 1rem;
      display: grid;
      gap: 0.5rem;
      z-index: 1000;
      max-inline-size: min(24rem, calc(100vw - 2rem));
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      background: #1f2937;
      color: #fff;
    }

    .toast--error {
      background: #b91c1c;
    }

    .toast--success {
      background: #15803d;
    }

    button {
      border: 0;
      background: transparent;
      color: inherit;
      font-size: 1.25rem;
      cursor: pointer;
    }
  `,
})
export class ToastHost {
  protected readonly toastService = inject(ToastService);
}
