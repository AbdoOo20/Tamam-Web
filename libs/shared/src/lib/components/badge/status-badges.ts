import { Component, computed, input } from '@angular/core';

import { Badge } from './badge';
import {
  ATTRIBUTION_META,
  CONFIRMATION_STATUS_META,
  MERCHANT_STATUS_META,
  ORDER_STATUS_META,
  RISK_LEVEL_META,
  SUBSCRIPTION_STATUS_META,
  Meta,
  metaOf,
} from '../../models/labels';

/** Order status pill: `<tamam-order-status [status]="order.statusId" />` */
@Component({
  selector: 'tamam-order-status',
  imports: [Badge],
  template: `<tamam-badge [tone]="meta().tone" [icon]="meta().icon">{{ meta().label }}</tamam-badge>`,
})
export class OrderStatusBadge {
  readonly status = input.required<number>();
  protected readonly meta = computed(() => metaOf(ORDER_STATUS_META, this.status()));
}

/** Risk level pill with the score: `<tamam-risk-badge [level]="1" [score]="23" />` */
@Component({
  selector: 'tamam-risk-badge',
  imports: [Badge],
  template: `
    @if (level(); as value) {
      <tamam-badge [tone]="meta().tone" [icon]="meta().icon">
        {{ meta().label }}@if (score() !== null && score() !== undefined) {
          <span class="ltr"> · {{ score() }}</span>
        }
      </tamam-badge>
    } @else {
      <span class="text-secondary small">لم يُقيَّم</span>
    }
  `,
})
export class RiskBadge {
  readonly level = input<number | null | undefined>();
  readonly score = input<number | null | undefined>();
  protected readonly meta = computed(() => metaOf(RISK_LEVEL_META, this.level()));
}

type MetaKind = 'attribution' | 'confirmation' | 'subscription' | 'merchant';

const TABLES: Record<MetaKind, Record<number, Meta>> = {
  attribution: ATTRIBUTION_META,
  confirmation: CONFIRMATION_STATUS_META,
  subscription: SUBSCRIPTION_STATUS_META,
  merchant: MERCHANT_STATUS_META,
};

/** Generic pill for the other enums: `<tamam-meta-badge kind="attribution" [value]="1" />` */
@Component({
  selector: 'tamam-meta-badge',
  imports: [Badge],
  template: `<tamam-badge [tone]="meta().tone" [icon]="meta().icon">{{ meta().label }}</tamam-badge>`,
})
export class MetaBadge {
  readonly kind = input.required<MetaKind>();
  readonly value = input.required<number | null | undefined>();
  protected readonly meta = computed(() => metaOf(TABLES[this.kind()], this.value()));
}
