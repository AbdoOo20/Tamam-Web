import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Badge,
  EmptyState,
  LoadingState,
  PageHeader,
  Pagination,
  SearchBox,
  TamamDatePipe,
  Tone,
  TooltipDirective,
} from '@tamam/shared';

import { CustomerForm } from '../../components/customer-form/customer-form';
import { Customer } from '../../models/customer.model';
import { CustomersStore } from '../../store/customers.store';

@Component({
  selector: 'tamam-customers-page',
  imports: [RouterLink, PageHeader, LoadingState, EmptyState, Badge, Pagination, SearchBox, TamamDatePipe, TooltipDirective, CustomerForm],
  providers: [CustomersStore],
  templateUrl: './customers-page.html',
})
export class CustomersPage implements OnInit {
  protected readonly store = inject(CustomersStore);
  protected readonly editing = signal<Customer | null>(null);

  ngOnInit(): void {
    void this.store.load();
  }

  protected reliabilityTone(score: number): Tone {
    return score >= 70 ? 'success' : score >= 40 ? 'warning' : 'danger';
  }

  protected refusalRate(customer: Customer): string {
    return customer.totalOrders === 0 ? '—' : `${Math.round((customer.refusedOrders / customer.totalOrders) * 100)}%`;
  }

  protected async onSaved(): Promise<void> {
    this.editing.set(null);
    await this.store.load();
  }
}
