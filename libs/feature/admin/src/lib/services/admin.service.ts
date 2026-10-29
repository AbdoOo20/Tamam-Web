import { inject, Service } from '@angular/core';
import { ApiClient, PagedResult } from '@tamam/core';
import { Observable } from 'rxjs';

import {
  AdminAuditLog,
  AdminMerchantDetail,
  AdminMerchantListItem,
  AdminOverview,
  AdminPlan,
  AdminPlanRequest,
  AdminRiskRule,
  CustomerDataExport,
  DataRequest,
  UpdateRiskRuleRequest,
} from '../models/admin.model';

@Service()
export class AdminService {
  private readonly api = inject(ApiClient);

  overview(): Observable<AdminOverview> {
    return this.api.get<AdminOverview>('admin/overview');
  }

  merchants(query: { page: number; pageSize: number; search?: string; status?: number }): Observable<PagedResult<AdminMerchantListItem>> {
    return this.api.get<PagedResult<AdminMerchantListItem>>('admin/merchants', { ...query });
  }

  merchant(id: number): Observable<AdminMerchantDetail> {
    return this.api.get<AdminMerchantDetail>(`admin/merchants/${id}`);
  }

  setMerchantStatus(id: number, status: number): Observable<AdminMerchantDetail> {
    return this.api.put<AdminMerchantDetail>(`admin/merchants/${id}/status`, { status }, { silent: true });
  }

  setMerchantPlan(id: number, planCode: string): Observable<AdminMerchantDetail> {
    return this.api.put<AdminMerchantDetail>(`admin/merchants/${id}/subscription`, { planCode }, { silent: true });
  }

  plans(): Observable<AdminPlan[]> {
    return this.api.get<AdminPlan[]>('admin/plans');
  }

  createPlan(request: AdminPlanRequest): Observable<AdminPlan> {
    return this.api.post<AdminPlan>('admin/plans', request, { silent: true });
  }

  updatePlan(id: number, request: AdminPlanRequest): Observable<AdminPlan> {
    return this.api.put<AdminPlan>(`admin/plans/${id}`, request, { silent: true });
  }

  riskRules(): Observable<AdminRiskRule[]> {
    return this.api.get<AdminRiskRule[]>('admin/risk-rules');
  }

  updateRiskRule(id: number, request: UpdateRiskRuleRequest): Observable<AdminRiskRule> {
    return this.api.put<AdminRiskRule>(`admin/risk-rules/${id}`, request, { silent: true });
  }

  dataRequests(query: { page: number; pageSize: number; status?: number; type?: number }): Observable<PagedResult<DataRequest>> {
    return this.api.get<PagedResult<DataRequest>>('admin/data-requests', { ...query });
  }

  processDataRequest(id: number, approve: boolean): Observable<DataRequest> {
    return this.api.post<DataRequest>(`admin/data-requests/${id}/process`, { approve }, { silent: true });
  }

  exportDataRequest(id: number): Observable<CustomerDataExport> {
    return this.api.get<CustomerDataExport>(`admin/data-requests/${id}/export`, undefined, { silent: true });
  }

  auditLogs(query: { page: number; pageSize: number; merchantId?: number }): Observable<PagedResult<AdminAuditLog>> {
    return this.api.get<PagedResult<AdminAuditLog>>('admin/audit-logs', { ...query });
  }

  recalculateQuality(year?: number, month?: number): Observable<void> {
    return this.api.post<void>('admin/quality/recalculate', { year, month });
  }
}
