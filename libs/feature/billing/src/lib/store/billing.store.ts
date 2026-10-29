import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { errorText, ToastService } from '@tamam/core';
import { catchError, firstValueFrom, of } from 'rxjs';

import { Plan, Subscription, UsageSummary } from '../models/billing.model';
import { BillingService } from '../services/billing.service';

interface BillingState {
  plans: Plan[];
  subscription: Subscription | null;
  usage: UsageSummary | null;
  loading: boolean;
  changing: string | null;
  error: string | null;
}

export const BillingStore = signalStore(
  withState<BillingState>({
    plans: [],
    subscription: null,
    usage: null,
    loading: false,
    changing: null,
    error: null,
  }),
  withMethods((store, service = inject(BillingService), toast = inject(ToastService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      try {
        const [plans, subscription, usage] = await Promise.all([
          firstValueFrom(service.plans()),
          firstValueFrom(service.subscription().pipe(catchError(() => of(null)))),
          firstValueFrom(service.usage(monthStart, now).pipe(catchError(() => of(null)))),
        ]);

        patchState(store, { plans, subscription, usage, loading: false });
      } catch (error) {
        patchState(store, { loading: false, error: errorText(error, 'تعذر تحميل بيانات الاشتراك') });
      }
    },

    async changePlan(planCode: string): Promise<void> {
      patchState(store, { changing: planCode });

      try {
        patchState(store, { subscription: await firstValueFrom(service.changePlan(planCode)) });
        toast.success('تم تغيير الباقة');
      } catch (error) {
        toast.error(errorText(error, 'تعذر تغيير الباقة'));
      } finally {
        patchState(store, { changing: null });
      }
    },
  })),
);
