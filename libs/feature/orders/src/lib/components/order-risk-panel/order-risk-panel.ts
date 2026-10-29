import { Component, computed, inject, input, signal } from '@angular/core';
import { errorText, ToastService } from '@tamam/core';
import {
  MERCHANT_DECISION_LABEL,
  MerchantDecision,
  RECOMMENDED_ACTION_LABEL,
  RISK_LEVEL_META,
  RiskBadge,
  metaOf,
} from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { OrderDetail } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailStore } from '../../store/order-detail.store';

@Component({
  selector: 'tamam-order-risk-panel',
  imports: [RiskBadge],
  templateUrl: './order-risk-panel.html',
  styleUrl: './order-risk-panel.scss',
})
export class OrderRiskPanel {
  private readonly service = inject(OrdersService);
  private readonly store = inject(OrderDetailStore);
  private readonly toast = inject(ToastService);
  readonly order = input.required<OrderDetail>();
  protected readonly busy = signal(false);
  protected readonly risk = computed(() => this.order().risk);
  protected readonly levelClass = computed(() => `level-${metaOf(RISK_LEVEL_META, this.risk()?.level).tone}`);
  protected readonly actionLabel = computed(() => RECOMMENDED_ACTION_LABEL[this.risk()?.recommendedAction ?? 0]);
  protected readonly decisionLabel = computed(() => {
    const decision = this.risk()?.merchantDecision;

    return decision ? MERCHANT_DECISION_LABEL[decision] : null;
  });
  protected readonly decisions = [
    { value: MerchantDecision.FollowedRecommendation, label: 'سأتبع التوصية', icon: 'bi-check2-circle' },
    { value: MerchantDecision.Ignored, label: 'سأتجاهلها', icon: 'bi-skip-forward' },
    { value: MerchantDecision.Reversed, label: 'سأفعل العكس', icon: 'bi-arrow-left-right' },
  ];

  protected async recalculate(): Promise<void> {
    await this.run(() => this.service.recalculateRisk(this.order().id), 'تم تحديث التقييم');
  }

  protected async decide(decision: MerchantDecision): Promise<void> {
    await this.run(() => this.service.decideRisk(this.order().id, decision), 'تم تسجيل قرارك');
  }

  private async run(action: () => ReturnType<OrdersService['recalculateRisk']>, success: string): Promise<void> {
    this.busy.set(true);

    try {
      await firstValueFrom(action());
      await this.store.refresh();
      this.toast.success(success);
    } catch (error) {
      this.toast.error(errorText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
