import { Component, computed, inject, OnInit } from '@angular/core';
import {
  ConfirmService,
  EmptyState,
  LoadingState,
  MetaBadge,
  MoneyPipe,
  PageHeader,
  TamamDatePipe,
  USAGE_TYPE_LABEL,
} from '@tamam/shared';

import { Plan } from '../../models/billing.model';
import { BillingStore } from '../../store/billing.store';

@Component({
  selector: 'tamam-billing-page',
  imports: [PageHeader, LoadingState, EmptyState, MetaBadge, MoneyPipe, TamamDatePipe],
  providers: [BillingStore],
  templateUrl: './billing-page.html',
})
export class BillingPage implements OnInit {
  protected readonly store = inject(BillingStore);
  private readonly confirmService = inject(ConfirmService);
  protected readonly usageLabel = USAGE_TYPE_LABEL;

  /** Share of the included orders already used, 0-100. */
  protected readonly usedPercent = computed(() => {
    const subscription = this.store.subscription();

    if (!subscription || subscription.plan.includedOrders <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((subscription.usedOrders / subscription.plan.includedOrders) * 100));
  });

  ngOnInit(): void {
    void this.store.load();
  }

  protected async choose(plan: Plan): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'تغيير الباقة',
      message: `سيتم تفعيل باقة «${plan.nameAr}» فورًا. لا يوجد دفع إلكتروني حاليًا، وتتم المحاسبة يدويًا من تقرير الاستخدام.`,
      confirmText: 'تفعيل الباقة',
    });

    if (confirmed) {
      await this.store.changePlan(plan.code);
    }
  }
}
