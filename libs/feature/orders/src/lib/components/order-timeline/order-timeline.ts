import { Component, input } from '@angular/core';
import { OrderStatusBadge, TamamDatePipe } from '@tamam/shared';

import { OrderStatusHistory } from '../../models/order.model';

@Component({
  selector: 'tamam-order-timeline',
  imports: [OrderStatusBadge, TamamDatePipe],
  template: `
    <section class="tm-card" aria-labelledby="timeline-title">
      <div class="tm-card-header"><span id="timeline-title">سجل الحالات</span></div>
      <ol class="list-unstyled mb-0 p-3 timeline">
        @for (entry of sorted(); track entry.id) {
          <li>
            <tamam-order-status [status]="entry.toStatusId" />
            <div class="small text-secondary mt-1">{{ entry.changedAt | tamamDate: 'datetime' }}</div>
            @if (entry.note) {
              <div class="small mt-1">{{ entry.note }}</div>
            }
          </li>
        }
      </ol>
    </section>
  `,
  styles: `
    .timeline li {
      position: relative;
      padding-inline-start: 1.25rem;
      padding-block-end: 1rem;
      border-inline-start: 2px solid var(--tm-border);
    }

    .timeline li::before {
      content: '';
      position: absolute;
      inset-inline-start: -0.4rem;
      inset-block-start: 0.35rem;
      inline-size: 0.7rem;
      block-size: 0.7rem;
      border-radius: 50%;
      background: var(--tm-primary);
    }

    .timeline li:last-child {
      padding-block-end: 0;
    }
  `,
})
export class OrderTimeline {
  readonly history = input.required<readonly OrderStatusHistory[]>();

  protected sorted(): OrderStatusHistory[] {
    return [...this.history()].sort((a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt));
  }
}
