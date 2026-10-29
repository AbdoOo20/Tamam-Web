import { inject, Service } from '@angular/core';
import { ApiClient } from '@tamam/core';
import { Observable } from 'rxjs';

export interface PublicPlan {
  id: number;
  code: string;
  nameAr: string;
  monthlyFee: number;
  pricePerCheckedOrder: number;
  includedOrders: number;
  currencyCode: string;
}

@Service()
export class PublicPlansService {
  private readonly api = inject(ApiClient);

  getPlans(): Observable<PublicPlan[]> {
    return this.api.get<PublicPlan[]>('billing/plans', undefined, { silent: true });
  }
}
