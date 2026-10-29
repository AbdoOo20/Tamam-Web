import { inject, Service } from '@angular/core';
import { ApiClient, PagedResult } from '@tamam/core';
import { MerchantDecision } from '@tamam/shared';
import { Observable } from 'rxjs';

import {
  AddDeliveryAttemptRequest,
  ChangeOrderStatusRequest,
  Confirmation,
  CreateOrderRequest,
  MessageLog,
  OrderDetail,
  OrderImportRequest,
  OrderImportResult,
  OrderItemRequest,
  OrderListItem,
  OrderOutcome,
  OrderQuery,
  RejectionReport,
  ReportRejectionRequest,
  RiskAssessment,
  UpdateLossRequest,
  UpdateOrderRequest,
} from '../models/order.model';

@Service()
export class OrdersService {
  private readonly api = inject(ApiClient);

  list(query: OrderQuery): Observable<PagedResult<OrderListItem>> {
    return this.api.get<PagedResult<OrderListItem>>('orders', { ...query });
  }

  get(id: number): Observable<OrderDetail> {
    return this.api.get<OrderDetail>(`orders/${id}`);
  }

  create(request: CreateOrderRequest): Observable<OrderDetail> {
    return this.api.post<OrderDetail>('orders', request, { silent: true });
  }

  update(id: number, request: UpdateOrderRequest): Observable<OrderDetail> {
    return this.api.put<OrderDetail>(`orders/${id}`, request, { silent: true });
  }

  updateItems(id: number, items: OrderItemRequest[]): Observable<OrderDetail> {
    return this.api.put<OrderDetail>(`orders/${id}/items`, { items }, { silent: true });
  }

  remove(id: number): Observable<void> {
    return this.api.delete(`orders/${id}`);
  }

  changeStatus(id: number, request: ChangeOrderStatusRequest): Observable<OrderDetail> {
    return this.api.post<OrderDetail>(`orders/${id}/status`, request, { silent: true });
  }

  addDeliveryAttempt(id: number, request: AddDeliveryAttemptRequest): Observable<OrderDetail> {
    return this.api.post<OrderDetail>(`orders/${id}/delivery-attempts`, request, { silent: true });
  }

  import(request: OrderImportRequest): Observable<OrderImportResult> {
    return this.api.post<OrderImportResult>('orders/import', request, { silent: true });
  }

  getConfirmation(id: number): Observable<Confirmation> {
    return this.api.get<Confirmation>(`orders/${id}/confirmation`);
  }

  markConfirmationSent(id: number): Observable<Confirmation> {
    return this.api.post<Confirmation>(`orders/${id}/confirmation/sent`);
  }

  regenerateConfirmation(id: number): Observable<Confirmation> {
    return this.api.post<Confirmation>(`orders/${id}/confirmation/regenerate`);
  }

  messages(id: number): Observable<MessageLog[]> {
    return this.api.get<MessageLog[]>(`orders/${id}/messages`);
  }

  recalculateRisk(id: number): Observable<RiskAssessment> {
    return this.api.post<RiskAssessment>(`orders/${id}/risk/recalculate`);
  }

  decideRisk(id: number, decision: MerchantDecision): Observable<RiskAssessment> {
    return this.api.post<RiskAssessment>(`orders/${id}/risk/decision`, { decision });
  }

  rejections(id: number): Observable<RejectionReport[]> {
    return this.api.get<RejectionReport[]>(`orders/${id}/rejections`);
  }

  outcome(id: number): Observable<OrderOutcome> {
    return this.api.get<OrderOutcome>(`orders/${id}/outcome`, undefined, { silent: true });
  }

  updateLoss(id: number, request: UpdateLossRequest): Observable<OrderOutcome> {
    return this.api.put<OrderOutcome>(`orders/${id}/outcome/loss`, request, { silent: true });
  }

  reportRejection(request: ReportRejectionRequest): Observable<RejectionReport> {
    return this.api.post<RejectionReport>('rejections', request, { silent: true });
  }
}
