import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { errorText, ToastService } from '@tamam/core';
import { firstValueFrom } from 'rxjs';

import { Product } from '../models/product.model';
import { ProductsService } from '../services/products.service';

type ActiveFilter = 'all' | 'active' | 'inactive';

interface ProductsState {
  items: Product[];
  page: number;
  totalPages: number;
  totalCount: number;
  search: string;
  activeFilter: ActiveFilter;
  loading: boolean;
  error: string | null;
}

const PAGE_SIZE = 15;

export const ProductsStore = signalStore(
  withState<ProductsState>({
    items: [],
    page: 1,
    totalPages: 0,
    totalCount: 0,
    search: '',
    activeFilter: 'all',
    loading: false,
    error: null,
  }),
  withMethods((store, service = inject(ProductsService), toast = inject(ToastService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        const filter = store.activeFilter();
        const result = await firstValueFrom(
          service.list({
            page: store.page(),
            pageSize: PAGE_SIZE,
            search: store.search(),
            isActive: filter === 'all' ? undefined : filter === 'active',
          }),
        );

        patchState(store, {
          items: result.items,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          loading: false,
        });
      } catch (error) {
        patchState(store, { loading: false, error: errorText(error, 'تعذر تحميل المنتجات') });
      }
    },

    async setSearch(search: string): Promise<void> {
      patchState(store, { search, page: 1 });
      await this.load();
    },

    async setActiveFilter(activeFilter: ActiveFilter): Promise<void> {
      patchState(store, { activeFilter, page: 1 });
      await this.load();
    },

    async setPage(page: number): Promise<void> {
      patchState(store, { page });
      await this.load();
    },

    async remove(product: Product): Promise<void> {
      try {
        await firstValueFrom(service.remove(product.id));
        toast.success('تم حذف المنتج');
        await this.load();
      } catch (error) {
        toast.error(errorText(error));
      }
    },
  })),
);
