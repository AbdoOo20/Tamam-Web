import { inject, Service } from '@angular/core';
import { ApiClient, PagedResult } from '@tamam/core';
import { Observable } from 'rxjs';

import { CarrierOption, MerchantInfo, ProductOption, Region } from '../models/lookups.model';

/** Small read-only lists the order screens need (carriers, products, regions). */
@Service()
export class OrderLookupsService {
  private readonly api = inject(ApiClient);

  carriers(): Observable<CarrierOption[]> {
    return this.api.get<CarrierOption[]>('carriers');
  }

  products(): Observable<PagedResult<ProductOption>> {
    return this.api.get<PagedResult<ProductOption>>('products', { pageSize: 100, isActive: true });
  }

  regions(countryCode: string): Observable<Region[]> {
    return this.api.get<Region[]>('lookups/regions', { countryCode });
  }

  merchant(): Observable<MerchantInfo> {
    return this.api.get<MerchantInfo>('merchant/profile');
  }
}
