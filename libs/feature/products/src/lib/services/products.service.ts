import { inject, Service } from '@angular/core';
import { ApiClient, PagedResult } from '@tamam/core';
import { Observable } from 'rxjs';

import { Product, ProductQuery, ProductRequest } from '../models/product.model';

@Service()
export class ProductsService {
  private readonly api = inject(ApiClient);

  list(query: ProductQuery): Observable<PagedResult<Product>> {
    return this.api.get<PagedResult<Product>>('products', { ...query });
  }

  create(request: ProductRequest): Observable<Product> {
    return this.api.post<Product>('products', request, { silent: true });
  }

  update(id: number, request: ProductRequest): Observable<Product> {
    return this.api.put<Product>(`products/${id}`, request, { silent: true });
  }

  remove(id: number): Observable<void> {
    return this.api.delete(`products/${id}`);
  }
}
