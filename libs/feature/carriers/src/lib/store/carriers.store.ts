import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { errorText, ToastService } from '@tamam/core';
import { firstValueFrom } from 'rxjs';

import { Carrier } from '../models/carrier.model';
import { CarriersService } from '../services/carriers.service';

interface CarriersState {
  items: Carrier[];
  loading: boolean;
  error: string | null;
}

export const CarriersStore = signalStore(
  withState<CarriersState>({ items: [], loading: false, error: null }),
  withMethods((store, service = inject(CarriersService), toast = inject(ToastService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        patchState(store, { items: await firstValueFrom(service.getAll()), loading: false });
      } catch (error) {
        patchState(store, { loading: false, error: errorText(error, 'تعذر تحميل شركات الشحن') });
      }
    },

    async remove(carrier: Carrier): Promise<void> {
      try {
        await firstValueFrom(service.remove(carrier.id));
        patchState(store, { items: store.items().filter((item) => item.id !== carrier.id) });
        toast.success('تم حذف شركة الشحن');
      } catch (error) {
        toast.error(errorText(error));
      }
    },
  })),
);
