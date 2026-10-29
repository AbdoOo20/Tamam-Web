import { inject, Service } from '@angular/core';
import { ApiClient } from '@tamam/core';
import { Observable } from 'rxjs';

import { Dashboard, QualityMonth } from '../models/dashboard.model';

@Service()
export class DashboardService {
  private readonly api = inject(ApiClient);

  dashboard(from: Date, to: Date): Observable<Dashboard> {
    return this.api.get<Dashboard>('reports/dashboard', { from, to });
  }

  quality(months: number): Observable<QualityMonth[]> {
    return this.api.get<QualityMonth[]>('reports/quality', { months });
  }
}
