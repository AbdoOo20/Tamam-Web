import { Service, signal } from '@angular/core';

import { Tone } from '../models/labels';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** `danger` makes the confirm button red (delete, cancel...). */
  tone?: Extract<Tone, 'danger' | 'primary' | 'warning'>;
}

export interface ConfirmRequest extends Required<ConfirmOptions> {
  resolve: (confirmed: boolean) => void;
}

/** Opens the confirmation dialog rendered by `<tamam-confirm-host />`. */
@Service()
export class ConfirmService {
  private readonly current = signal<ConfirmRequest | null>(null);
  readonly request = this.current.asReadonly();

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.current.set({
        confirmText: 'تأكيد',
        cancelText: 'إلغاء',
        tone: 'primary',
        ...options,
        resolve,
      });
    });
  }

  answer(confirmed: boolean): void {
    this.current()?.resolve(confirmed);
    this.current.set(null);
  }
}
