import { Component, computed, inject, input, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, pattern } from '@angular/forms/signals';
import { errorText, ToastService } from '@tamam/core';
import {
  DELIVERY_ATTEMPT_LABEL,
  DeliveryAttemptResult,
  Field,
  Modal,
  OrderStatus,
  TamamDatePipe,
  TooltipDirective,
} from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { OrderDetail } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailStore } from '../../store/order-detail.store';

@Component({
  selector: 'tamam-order-attempts-card',
  imports: [TamamDatePipe, TooltipDirective, Modal, Field, FormRoot, FormField],
  templateUrl: './order-attempts-card.html',
})
export class OrderAttemptsCard {
  private readonly service = inject(OrdersService);
  private readonly store = inject(OrderDetailStore);
  private readonly toast = inject(ToastService);
  readonly order = input.required<OrderDetail>();
  protected readonly label = DELIVERY_ATTEMPT_LABEL;
  protected readonly results = Object.entries(DELIVERY_ATTEMPT_LABEL).map(([value, text]) => ({ value, text }));
  protected readonly adding = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly canAdd = computed(() =>
    ([OrderStatus.Shipped, OrderStatus.OutForDelivery, OrderStatus.FailedDelivery] as number[]).includes(this.order().statusId),
  );
  private readonly model = signal({ result: String(DeliveryAttemptResult.Delivered), carrierNote: '', proofImageUrl: '' });
  protected readonly attemptForm = form(
    this.model,
    (path) => {
      maxLength(path.carrierNote, 500, { message: 'الملاحظة طويلة جدًا' });
      maxLength(path.proofImageUrl, 500, { message: 'الرابط طويل جدًا' });
      pattern(path.proofImageUrl, /^(https?:\/\/.*)?$/, { message: 'يجب أن يبدأ الرابط بـ http أو https' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const value = this.model();

          try {
            const updated = await firstValueFrom(
              this.service.addDeliveryAttempt(this.order().id, {
                result: Number(value.result) as DeliveryAttemptResult,
                carrierNote: value.carrierNote.trim() || null,
                proofImageUrl: value.proofImageUrl.trim() || null,
              }),
            );

            this.store.set(updated);
            this.toast.success('تم تسجيل محاولة التسليم');
            this.adding.set(false);
          } catch (error) {
            this.serverError.set(errorText(error));
          }
        },
      },
    },
  );

  protected open(): void {
    this.serverError.set(null);
    this.model.set({ result: String(DeliveryAttemptResult.Delivered), carrierNote: '', proofImageUrl: '' });
    this.adding.set(true);
  }
}
