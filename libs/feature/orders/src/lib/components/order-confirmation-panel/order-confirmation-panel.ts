import { Component, computed, inject, input, signal } from '@angular/core';
import { errorText, ToastService } from '@tamam/core';
import {
  ConfirmationStatus,
  ConfirmService,
  CopyButton,
  MetaBadge,
  OrderStatus,
  TamamDatePipe,
} from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { OrderDetail } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailStore } from '../../store/order-detail.store';

@Component({
  selector: 'tamam-order-confirmation-panel',
  imports: [MetaBadge, CopyButton, TamamDatePipe],
  templateUrl: './order-confirmation-panel.html',
  styles: `
    .message {
      margin-bottom: 1rem;
      padding: 0.85rem 1rem;
      border: 1px solid #cfe8dd;
      border-radius: 10px;
      background: #f1f8f5;
      font: inherit;
      white-space: pre-wrap;
    }
  `,
})
export class OrderConfirmationPanel {
  private readonly service = inject(OrdersService);
  private readonly store = inject(OrderDetailStore);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  readonly order = input.required<OrderDetail>();
  protected readonly busy = signal(false);
  protected readonly confirmation = computed(() => this.order().confirmation);
  /** The merchant can still send the message when the customer has not answered. */
  protected readonly canSend = computed(() => {
    const status = this.confirmation()?.status;

    return (
      status !== undefined &&
      status !== ConfirmationStatus.Confirmed &&
      status !== ConfirmationStatus.Cancelled &&
      this.order().statusId <= OrderStatus.DepositRequested
    );
  });

  /** Called when the WhatsApp link was opened in a new tab: records that it was sent. */
  protected async markSent(): Promise<void> {
    const current = this.confirmation();

    if (!current || current.status !== ConfirmationStatus.Created) {
      return;
    }

    try {
      await firstValueFrom(this.service.markConfirmationSent(this.order().id));
      await this.store.refresh();
    } catch (error) {
      this.toast.error(errorText(error));
    }
  }

  protected async regenerate(): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'إنشاء رابط جديد',
      message: 'سيتوقف الرابط الحالي عن العمل ويُنشأ رابط ورسالة جديدان. هل تريد المتابعة؟',
      confirmText: 'إنشاء رابط جديد',
    });

    if (!confirmed) {
      return;
    }

    this.busy.set(true);

    try {
      await firstValueFrom(this.service.regenerateConfirmation(this.order().id));
      await this.store.refresh();
      this.toast.success('تم إنشاء رابط جديد');
    } catch (error) {
      this.toast.error(errorText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
