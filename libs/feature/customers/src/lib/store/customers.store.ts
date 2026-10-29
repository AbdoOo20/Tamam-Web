import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { errorText } from '@tamam/core';
import { firstValueFrom } from 'rxjs';

import { Customer } from '../models/customer.model';
import { CustomersService } from '../services/customers.service';

interface CustomersState {
  items: Customer[];
  page: number;
  totalPages: number;
  totalCount: number;
  search: string;
  loading: boolean;
  error: string | null;
}

const PAGE_SIZE = 15;

export const CustomersStore = signalStore(
  withState<CustomersState>({
    items: [],
    page: 1,
    totalPages: 0,
    totalCount: 0,
    search: '',
    loading: false,
    error: null,
  }),
  withMethods((store, service = inject(CustomersService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        const result = await firstValueFrom(
          service.list({ page: store.page(), pageSize: PAGE_SIZE, search: store.search() }),
        );

        patchState(store, {
          items: result.items,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          loading: false,
        });
      } catch (error) {
        patchState(store, { loading: false, error: errorText(error, 'تعذر تحميل العملاء') });
      }
    },

    async setSearch(search: string): Promise<void> {
      patchState(store, { search, page: 1 });
      await this.load();
    },

    async setPage(page: number): Promise<void> {
      patchState(store, { page });
      await this.load();
    },
  })),
);
