import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { errorText, ToastService } from '@tamam/core';
import {
  ConfirmService,
  EmptyState,
  LoadingState,
  MESSAGE_DELIVERY_LABEL,
  MoneyPipe,
  OrderStatus,
  OrderStatusBadge,
  PAYMENT_METHOD_LABEL,
  RiskBadge,
  TamamDatePipe,
} from '@tamam/shared';
import { catchError, firstValueFrom, of } from 'rxjs';

import { OrderAttemptsCard } from '../../components/order-attempts-card/order-attempts-card';
import { OrderConfirmationPanel } from '../../components/order-confirmation-panel/order-confirmation-panel';
import { OrderItemsCard } from '../../components/order-items-card/order-items-card';
import { OrderOutcomeCard } from '../../components/order-outcome-card/order-outcome-card';
import { OrderRiskPanel } from '../../components/order-risk-panel/order-risk-panel';
import { OrderStatusDialog } from '../../components/order-status-dialog/order-status-dialog';
import { OrderTimeline } from '../../components/order-timeline/order-timeline';
import { MessageLog } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailStore } from '../../store/order-detail.store';

@Component({
  selector: 'tamam-order-detail-page',
  imports: [
    RouterLink,
    EmptyState,
    LoadingState,
    MoneyPipe,
    OrderStatusBadge,
    RiskBadge,
    TamamDatePipe,
    OrderAttemptsCard,
    OrderConfirmationPanel,
    OrderItemsCard,
    OrderOutcomeCard,
    OrderRiskPanel,
    OrderStatusDialog,
    OrderTimeline,
  ],
  providers: [OrderDetailStore],
  templateUrl: './order-detail-page.html',
})
export class OrderDetailPage {
  private readonly service = inject(OrdersService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly store = inject(OrderDetailStore);
  /** Bound from the `:id` route parameter. */
  readonly id = input.required<string>();
  protected readonly changingStatus = signal(false);
  protected readonly payment = PAYMENT_METHOD_LABEL;
  protected readonly deliveryLabel = MESSAGE_DELIVERY_LABEL;
  protected readonly messages = signal<MessageLog[] | null>(null);
  protected readonly loadingMessages = signal(false);

  constructor() {
    effect(() => {
      const id = Number(this.id());

      untracked(() => {
        this.messages.set(null);
        void this.store.load(id);
      });
    });
  }

  protected canChangeStatus(status: number): boolean {
    return !(
      [
        OrderStatus.Delivered,
        OrderStatus.Returned,
        OrderStatus.CancelledByMerchant,
        OrderStatus.CancelledByCustomer,
      ] as number[]
    ).includes(status);
  }

  protected whatsAppLink(phone: string): string {
    return `https://wa.me/${phone.replace(/\D/g, '')}`;
  }

  protected async loadMessages(): Promise<void> {
    const order = this.store.order();

    if (!order) {
      return;
    }

    this.loadingMessages.set(true);
    this.messages.set(await firstValueFrom(this.service.messages(order.id).pipe(catchError(() => of([])))));
    this.loadingMessages.set(false);
  }

  protected async remove(): Promise<void> {
    const order = this.store.order();

    if (!order) {
      return;
    }

    const confirmed = await this.confirmService.confirm({
      title: 'حذف الطلب',
      message: `سيُحذف الطلب ${order.orderNo} من قائمتك. هل أنت متأكد؟`,
      confirmText: 'حذف الطلب',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await firstValueFrom(this.service.remove(order.id));
      this.toast.success('تم حذف الطلب');
      await this.router.navigate(['/orders']);
    } catch (error) {
      this.toast.error(errorText(error));
    }
  }
}
