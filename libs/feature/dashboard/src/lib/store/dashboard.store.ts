import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { errorText } from '@tamam/core';
import { firstValueFrom } from 'rxjs';

import { Dashboard, QualityMonth } from '../models/dashboard.model';
import { DashboardService } from '../services/dashboard.service';

interface DashboardState {
  days: number;
  data: Dashboard | null;
  quality: QualityMonth[];
  loading: boolean;
  error: string | null;
}

export const DashboardStore = signalStore(
  withState<DashboardState>({ days: 30, data: null, quality: [], loading: false, error: null }),
  withMethods((store, service = inject(DashboardService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });

      const to = new Date();
      const from = new Date();

      from.setDate(from.getDate() - (store.days() - 1));

      try {
        const [data, quality] = await Promise.all([
          firstValueFrom(service.dashboard(from, to)),
          firstValueFrom(service.quality(6)),
        ]);

        patchState(store, { data, quality, loading: false });
      } catch (error) {
        patchState(store, { loading: false, error: errorText(error, 'تعذر تحميل لوحة التحكم') });
      }
    },

    async setDays(days: number): Promise<void> {
      patchState(store, { days });
      await this.load();
    },
  })),
);
