import { Component, computed, inject, input, signal } from '@angular/core';
import { applyEach, form, FormField, FormRoot, max, maxLength, min, required } from '@angular/forms/signals';
import { errorText, ToastService } from '@tamam/core';
import { EDITABLE_ORDER_STATUSES, Field, Modal, MoneyPipe, TooltipDirective } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { OrderDetail } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailStore } from '../../store/order-detail.store';

interface ItemModel {
  productId: number | null;
  productName: string;
  variant: string;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'tamam-order-items-card',
  imports: [MoneyPipe, TooltipDirective, Modal, Field, FormRoot, FormField],
  templateUrl: './order-items-card.html',
})
export class OrderItemsCard {
  private readonly service = inject(OrdersService);
  private readonly store = inject(OrderDetailStore);
  private readonly toast = inject(ToastService);

  readonly order = input.required<OrderDetail>();

  protected readonly editing = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly canEdit = computed(() => (EDITABLE_ORDER_STATUSES as readonly number[]).includes(this.order().statusId));

  protected readonly model = signal<{ items: ItemModel[] }>({ items: [] });

  protected readonly itemsForm = form(
    this.model,
    (path) => {
      applyEach(path.items, (item) => {
        required(item.productName, { message: 'اسم المنتج مطلوب' });
        maxLength(item.productName, 200, { message: 'الاسم طويل جدًا' });
        maxLength(item.variant, 100, { message: 'طويل جدًا' });
        min(item.quantity, 1, { message: 'الكمية 1 على الأقل' });
        max(item.quantity, 10000, { message: 'الكمية كبيرة جدًا' });
        min(item.unitPrice, 0, { message: 'السعر لا يمكن أن يكون سالبًا' });
      });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const items = this.model().items;

          if (items.length === 0) {
            this.serverError.set('يجب أن يحتوي الطلب على منتج واحد على الأقل');

            return;
          }

          try {
            const updated = await firstValueFrom(
              this.service.updateItems(
                this.order().id,
                items.map((item) => ({
                  productId: item.productId,
                  productName: item.productName.trim(),
                  variant: item.variant.trim() || null,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice || 0,
                })),
              ),
            );

            this.store.set(updated);
            this.toast.success('تم تحديث المنتجات وإعادة حساب الإجمالي');
            this.editing.set(false);
          } catch (error) {
            this.serverError.set(errorText(error));
          }
        },
      },
    },
  );

  protected edit(): void {
    this.serverError.set(null);
    this.model.set({
      items: this.order().items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        variant: item.variant ?? '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
    this.editing.set(true);
  }

  protected addItem(): void {
    this.model.update((m) => ({
      items: [...m.items, { productId: null, productName: '', variant: '', quantity: 1, unitPrice: 0 }],
    }));
  }

  protected removeItem(index: number): void {
    this.model.update((m) => ({ items: m.items.filter((_, i) => i !== index) }));
  }
}
