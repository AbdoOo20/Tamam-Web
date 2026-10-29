import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { errorText } from '@tamam/core';
import { firstValueFrom } from 'rxjs';

import { OrderListItem } from '../models/order.model';
import { OrdersService } from '../services/orders.service';

export interface OrderFilters {
  search: string;
  statusId: number | null;
  riskLevel: number | null;
  carrierId: number | null;
  from: string;
  to: string;
}

interface OrdersState {
  items: OrderListItem[];
  page: number;
  totalPages: number;
  totalCount: number;
  filters: OrderFilters;
  loading: boolean;
  error: string | null;
}

const PAGE_SIZE = 15;

export const EMPTY_FILTERS: OrderFilters = {
  search: '',
  statusId: null,
  riskLevel: null,
  carrierId: null,
  from: '',
  to: '',
};

/** State of the orders list: the current page and the filters. */
export const OrdersStore = signalStore(
  withState<OrdersState>({
    items: [],
    page: 1,
    totalPages: 0,
    totalCount: 0,
    filters: EMPTY_FILTERS,
    loading: false,
    error: null,
  }),
  withMethods((store, service = inject(OrdersService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });

      const f = store.filters();

      try {
        const result = await firstValueFrom(
          service.list({
            page: store.page(),
            pageSize: PAGE_SIZE,
            search: f.search || undefined,
            statusId: f.statusId ?? undefined,
            riskLevel: f.riskLevel ?? undefined,
            carrierId: f.carrierId ?? undefined,
            from: f.from ? new Date(`${f.from}T00:00:00`).toISOString() : undefined,
            to: f.to ? new Date(`${f.to}T23:59:59`).toISOString() : undefined,
          }),
        );

        patchState(store, {
          items: result.items,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          loading: false,
        });
      } catch (error) {
        patchState(store, { loading: false, error: errorText(error, 'تعذر تحميل الطلبات') });
      }
    },

    async setFilters(changes: Partial<OrderFilters>): Promise<void> {
      patchState(store, { filters: { ...store.filters(), ...changes }, page: 1 });
      await this.load();
    },

    async clearFilters(): Promise<void> {
      patchState(store, { filters: EMPTY_FILTERS, page: 1 });
      await this.load();
    },

    async setPage(page: number): Promise<void> {
      patchState(store, { page });
      await this.load();
    },
  })),
);
