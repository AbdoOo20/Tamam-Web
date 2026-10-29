import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  EmptyState,
  LoadingState,
  MoneyPipe,
  ORDER_STATUS_META,
  OrderStatusBadge,
  PageHeader,
  Pagination,
  RISK_LEVEL_META,
  RiskBadge,
  SearchBox,
  TamamDatePipe,
  TooltipDirective,
} from '@tamam/shared';
import { catchError, of } from 'rxjs';

import { OrderLookupsService } from '../../services/order-lookups.service';
import { OrdersStore } from '../../store/orders.store';

@Component({
  selector: 'tamam-orders-page',
  imports: [
    RouterLink,
    PageHeader,
    LoadingState,
    EmptyState,
    Pagination,
    SearchBox,
    OrderStatusBadge,
    RiskBadge,
    MoneyPipe,
    TamamDatePipe,
    TooltipDirective,
  ],
  providers: [OrdersStore],
  templateUrl: './orders-page.html',
})
export class OrdersPage implements OnInit {
  protected readonly store = inject(OrdersStore);

  protected readonly carriers = toSignal(
    inject(OrderLookupsService)
      .carriers()
      .pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  protected readonly statusOptions = Object.entries(ORDER_STATUS_META).map(([id, meta]) => ({ id: +id, label: meta.label }));
  protected readonly riskOptions = Object.entries(RISK_LEVEL_META).map(([id, meta]) => ({ id: +id, label: meta.label }));
  protected readonly showFilters = signal(false);

  ngOnInit(): void {
    void this.store.load();
  }

  protected hasFilters(): boolean {
    const f = this.store.filters();

    return !!(f.search || f.statusId || f.riskLevel || f.carrierId || f.from || f.to);
  }

  protected onSelect(key: 'statusId' | 'riskLevel' | 'carrierId', event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    void this.store.setFilters({ [key]: value ? Number(value) : null });
  }

  protected onDate(key: 'from' | 'to', event: Event): void {
    void this.store.setFilters({ [key]: (event.target as HTMLInputElement).value });
  }
}
