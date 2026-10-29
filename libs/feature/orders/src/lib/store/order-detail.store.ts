import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { errorText } from '@tamam/core';
import { firstValueFrom } from 'rxjs';

import { OrderDetail } from '../models/order.model';
import { OrdersService } from '../services/orders.service';

interface OrderDetailState {
  order: OrderDetail | null;
  loading: boolean;
  error: string | null;
}

/** The order shown on the details page. Child panels call `set` with the fresh order after an action. */
export const OrderDetailStore = signalStore(
  withState<OrderDetailState>({ order: null, loading: false, error: null }),
  withMethods((store, service = inject(OrdersService)) => ({
    async load(id: number): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        patchState(store, { order: await firstValueFrom(service.get(id)), loading: false });
      } catch (error) {
        patchState(store, { loading: false, error: errorText(error, 'تعذر تحميل الطلب') });
      }
    },

    /** Reloads without showing the page spinner. */
    async refresh(): Promise<void> {
      const current = store.order();

      if (!current) {
        return;
      }

      try {
        patchState(store, { order: await firstValueFrom(service.get(current.id)) });
      } catch (error) {
        patchState(store, { error: errorText(error, 'تعذر تحديث الطلب') });
      }
    },

    set(order: OrderDetail): void {
      patchState(store, { order, error: null });
    },
  })),
);
