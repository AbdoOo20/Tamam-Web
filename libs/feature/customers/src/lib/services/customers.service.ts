import { inject, Service } from '@angular/core';
import { ApiClient, PagedQuery, PagedResult } from '@tamam/core';
import { Observable } from 'rxjs';

import { Customer, UpdateCustomerRequest } from '../models/customer.model';

@Service()
export class CustomersService {
  private readonly api = inject(ApiClient);

  list(query: PagedQuery): Observable<PagedResult<Customer>> {
    return this.api.get<PagedResult<Customer>>('customers', { ...query });
  }

  update(id: number, request: UpdateCustomerRequest): Observable<Customer> {
    return this.api.put<Customer>(`customers/${id}`, request, { silent: true });
  }
}
