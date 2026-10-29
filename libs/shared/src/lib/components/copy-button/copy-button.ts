import { Component, inject, input, signal } from '@angular/core';
import { ToastService } from '@tamam/core';

/** Copies a value to the clipboard and confirms with a toast. */
@Component({
  selector: 'tamam-copy-button',
  template: `
    <button type="button" class="btn btn-sm btn-outline-secondary" (click)="copy()">
      <i class="bi" [class]="copied() ? 'bi-check2' : 'bi-clipboard'" aria-hidden="true"></i>
      {{ copied() ? 'تم النسخ' : label() }}
    </button>
  `,
})
export class CopyButton {
  private readonly toast = inject(ToastService);
  readonly value = input.required<string>();
  readonly label = input('نسخ');
  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.value());
      this.copied.set(true);
      this.toast.success('تم النسخ');
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.toast.error('تعذر النسخ، انسخ النص يدويًا');
    }
  }
}
