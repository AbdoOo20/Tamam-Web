import { inject, Service } from '@angular/core';
import { ApiClient } from '@tamam/core';
import { Observable } from 'rxjs';

import { Carrier, CarrierRequest } from '../models/carrier.model';

@Service()
export class CarriersService {
  private readonly api = inject(ApiClient);

  getAll(): Observable<Carrier[]> {
    return this.api.get<Carrier[]>('carriers');
  }

  create(request: CarrierRequest): Observable<Carrier> {
    return this.api.post<Carrier>('carriers', request, { silent: true });
  }

  update(id: number, request: CarrierRequest): Observable<Carrier> {
    return this.api.put<Carrier>(`carriers/${id}`, request, { silent: true });
  }

  remove(id: number): Observable<void> {
    return this.api.delete(`carriers/${id}`);
  }
}
