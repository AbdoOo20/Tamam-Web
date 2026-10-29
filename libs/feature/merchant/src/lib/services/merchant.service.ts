import { inject, Service } from '@angular/core';
import { ApiClient, PagedResult } from '@tamam/core';
import { Observable } from 'rxjs';

import {
  AuditLog,
  AuditQuery,
  Consent,
  CreateStaffRequest,
  MerchantProfile,
  MessageTemplate,
  Staff,
  UpdateMerchantProfileRequest,
} from '../models/merchant.model';

@Service()
export class MerchantService {
  private readonly api = inject(ApiClient);

  profile(): Observable<MerchantProfile> {
    return this.api.get<MerchantProfile>('merchant/profile');
  }

  updateProfile(request: UpdateMerchantProfileRequest): Observable<MerchantProfile> {
    return this.api.put<MerchantProfile>('merchant/profile', request, { silent: true });
  }

  consent(): Observable<Consent> {
    return this.api.get<Consent>('merchant/consent', undefined, { silent: true });
  }

  acceptConsent(termsVersion: string, shareOutcomesToNetwork: boolean): Observable<Consent> {
    return this.api.post<Consent>('merchant/consent', { termsVersion, shareOutcomesToNetwork }, { silent: true });
  }

  staff(): Observable<Staff[]> {
    return this.api.get<Staff[]>('staff');
  }

  createStaff(request: CreateStaffRequest): Observable<Staff> {
    return this.api.post<Staff>('staff', request, { silent: true });
  }

  removeStaff(id: number): Observable<void> {
    return this.api.delete(`staff/${id}`);
  }

  apiKeyStatus(): Observable<{ hasKey: boolean }> {
    return this.api.get<{ hasKey: boolean }>('merchant/api-key');
  }

  generateApiKey(): Observable<{ apiKey: string }> {
    return this.api.post<{ apiKey: string }>('merchant/api-key');
  }

  revokeApiKey(): Observable<void> {
    return this.api.delete('merchant/api-key');
  }

  auditLogs(query: AuditQuery): Observable<PagedResult<AuditLog>> {
    return this.api.get<PagedResult<AuditLog>>('auditlogs', { ...query });
  }

  templates(): Observable<MessageTemplate[]> {
    return this.api.get<MessageTemplate[]>('messages/templates');
  }
}
