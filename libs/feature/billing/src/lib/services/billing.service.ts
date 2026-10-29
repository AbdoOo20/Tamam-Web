import { inject, Service } from '@angular/core';
import { ApiClient } from '@tamam/core';
import { Observable } from 'rxjs';

import { Plan, Subscription, UsageSummary } from '../models/billing.model';

@Service()
export class BillingService {
  private readonly api = inject(ApiClient);

  plans(): Observable<Plan[]> {
    return this.api.get<Plan[]>('billing/plans');
  }

  subscription(): Observable<Subscription> {
    return this.api.get<Subscription>('billing/subscription', undefined, { silent: true });
  }

  usage(from: Date, to: Date): Observable<UsageSummary> {
    return this.api.get<UsageSummary>('billing/usage', { from, to });
  }

  changePlan(planCode: string): Observable<Subscription> {
    return this.api.post<Subscription>('billing/subscription/change', { planCode }, { silent: true });
  }
}
