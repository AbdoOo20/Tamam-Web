import { Component, computed, inject, input, output, signal } from '@angular/core';
import { errorText, ToastService } from '@tamam/core';
import { Modal, OrderStatus, ORDER_STATUS_META, ORDER_TRANSITIONS } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { OrderDetail } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailStore } from '../../store/order-detail.store';

/** Lets the merchant move the order to one of the statuses the backend allows. */
@Component({
  selector: 'tamam-order-status-dialog',
  imports: [Modal],
  template: `
    <tamam-modal title="تغيير حالة الطلب" (closed)="closed.emit()">
      @if (error(); as message) {
        <div class="alert alert-danger" role="alert">{{ message }}</div>
      }

      <fieldset class="mb-3">
        <legend class="form-label">الحالة الجديدة</legend>
        <div class="d-grid gap-2">
          @for (option of options(); track option.id) {
            <label class="option" [class.selected]="selected() === option.id">
              <input type="radio" name="status" class="form-check-input" [value]="option.id" [checked]="selected() === option.id" (change)="selected.set(option.id)" />
              <i class="bi" [class]="option.icon" aria-hidden="true"></i>
              <span>{{ option.label }}</span>
            </label>
          }
        </div>
      </fieldset>

      <label class="form-label" for="status-note">ملاحظة (اختياري)</label>
      <textarea id="status-note" class="form-control" rows="2" maxlength="500" [value]="note()" (input)="onNote($event)"></textarea>

      <div modal-footer class="d-flex gap-2">
        <button type="button" class="btn btn-light" (click)="closed.emit()">إلغاء</button>
        <button type="button" class="btn btn-primary" [disabled]="selected() === null || busy()" (click)="save()">تغيير الحالة</button>
      </div>
    </tamam-modal>
  `,
  styles: `
    .option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.9rem;
      border: 1px solid var(--tm-border);
      border-radius: 10px;
      cursor: pointer;
    }

    .option.selected {
      border-color: var(--tm-primary);
      background: var(--tm-primary-soft);
    }

    fieldset {
      border: 0;
      padding: 0;
    }
  `,
})
export class OrderStatusDialog {
  private readonly service = inject(OrdersService);
  private readonly store = inject(OrderDetailStore);
  private readonly toast = inject(ToastService);

  readonly order = input.required<OrderDetail>();
  readonly closed = output<void>();

  protected readonly selected = signal<OrderStatus | null>(null);
  protected readonly note = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly options = computed(() =>
    (ORDER_TRANSITIONS[this.order().statusId] ?? []).map((id) => ({ id, ...ORDER_STATUS_META[id] })),
  );

  protected onNote(event: Event): void {
    this.note.set((event.target as HTMLTextAreaElement).value);
  }

  protected async save(): Promise<void> {
    const statusId = this.selected();

    if (statusId === null) {
      return;
    }

    this.busy.set(true);
    this.error.set(null);

    try {
      const updated = await firstValueFrom(
        this.service.changeStatus(this.order().id, { statusId, note: this.note().trim() || null }),
      );

      this.store.set(updated);
      this.toast.success('تم تغيير حالة الطلب');
      this.closed.emit();
    } catch (error) {
      this.error.set(errorText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
