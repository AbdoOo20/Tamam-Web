import { inject, Service } from '@angular/core';
import { ApiClient } from '@tamam/core';
import { Observable } from 'rxjs';

import { Country } from '../models/country.model';

@Service()
export class CountriesService {
  private readonly api = inject(ApiClient);

  getAll(): Observable<Country[]> {
    return this.api.get<Country[]>('countries');
  }
}
