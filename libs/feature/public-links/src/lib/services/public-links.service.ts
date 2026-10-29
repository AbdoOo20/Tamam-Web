import { inject, Service } from '@angular/core';
import { ApiClient } from '@tamam/core';
import { Observable } from 'rxjs';

import { PublicOrder, PublicRejectionReason } from '../models/public-link.model';

/** Calls the anonymous endpoints used by the links we send to customers. */
@Service()
export class PublicLinksService {
  private readonly api = inject(ApiClient);

  get(token: string): Observable<PublicOrder> {
    return this.api.get<PublicOrder>(`public/links/${token}`, undefined, { silent: true });
  }

  reasons(): Observable<PublicRejectionReason[]> {
    return this.api.get<PublicRejectionReason[]>('public/rejection-reasons', undefined, { silent: true });
  }

  confirm(token: string, proposedDeliveryDate: string | null, note: string | null): Observable<void> {
    return this.api.post<void>(`public/links/${token}/confirm`, { proposedDeliveryDate, note }, { silent: true });
  }

  reschedule(token: string, proposedDeliveryDate: string, note: string | null): Observable<void> {
    return this.api.post<void>(`public/links/${token}/reschedule`, { proposedDeliveryDate, note }, { silent: true });
  }

  cancel(token: string, reasonId: number, details: string | null): Observable<void> {
    return this.api.post<void>(`public/links/${token}/cancel`, { reasonId, details }, { silent: true });
  }

  survey(token: string, reasonId: number, details: string | null): Observable<void> {
    return this.api.post<void>(`public/links/${token}/survey`, { reasonId, details }, { silent: true });
  }

  optOut(token: string): Observable<void> {
    return this.api.post<void>(`public/links/${token}/opt-out`, {}, { silent: true });
  }

  dataRequest(token: string, type: number): Observable<void> {
    return this.api.post<void>(`public/links/${token}/data-request`, { type }, { silent: true });
  }
}
