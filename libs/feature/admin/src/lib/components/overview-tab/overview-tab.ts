import { Component, inject, OnInit, signal } from '@angular/core';
import { errorText, ToastService } from '@tamam/core';
import { EmptyState, LoadingState, StatCard } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { AdminOverview } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'tamam-overview-tab',
  imports: [EmptyState, LoadingState, StatCard],
  template: `
    @if (loading()) {
      <tamam-loading />
    } @else if (overview(); as o) {
      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-xl-3"><tamam-stat-card label="التجار" [value]="o.merchants" icon="bi-shop" [hint]="o.activeMerchants + ' نشط · ' + o.trialMerchants + ' تجريبي'" /></div>
        <div class="col-sm-6 col-xl-3"><tamam-stat-card label="إجمالي الطلبات" [value]="o.totalOrders" icon="bi-bag" tone="info" [hint]="o.ordersLast30Days + ' آخر 30 يومًا'" /></div>
        <div class="col-sm-6 col-xl-3"><tamam-stat-card label="نسبة الرفض (30 يومًا)" [value]="o.refusalRateLast30DaysPercent + '%'" icon="bi-x-octagon" tone="danger" [hint]="o.refusedLast30Days + ' مرفوض من ' + (o.deliveredLast30Days + o.refusedLast30Days) + ' مكتمل'" /></div>
        <div class="col-sm-6 col-xl-3"><tamam-stat-card label="طلبات بيانات مفتوحة" [value]="o.openDataRequests" icon="bi-inbox" tone="warning" [hint]="o.suspendedMerchants + ' تاجر موقوف'" /></div>
      </div>

      <div class="tm-card p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <strong>إعادة حساب إحصاءات الجودة</strong>
          <p class="text-secondary small mb-0">تُحدَّث تلقائيًا كل ساعة. استخدم الزر بعد تصحيح بيانات يدويًا.</p>
        </div>
        <button type="button" class="btn btn-outline-primary" [disabled]="recalculating()" (click)="recalculate()">
          <i class="bi bi-arrow-repeat" aria-hidden="true"></i> إعادة الحساب
        </button>
      </div>
    } @else {
      <tamam-empty-state icon="bi-wifi-off" title="تعذر التحميل" [description]="error() ?? ''">
        <button type="button" class="btn btn-primary" (click)="load()">إعادة المحاولة</button>
      </tamam-empty-state>
    }
  `,
})
export class OverviewTab implements OnInit {
  private readonly service = inject(AdminService);
  private readonly toast = inject(ToastService);

  protected readonly overview = signal<AdminOverview | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly recalculating = signal(false);

  ngOnInit(): Promise<void> {
    return this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);

    try {
      this.overview.set(await firstValueFrom(this.service.overview()));
    } catch (error) {
      this.error.set(errorText(error, 'تعذر تحميل النظرة العامة'));
    } finally {
      this.loading.set(false);
    }
  }

  protected async recalculate(): Promise<void> {
    this.recalculating.set(true);

    try {
      await firstValueFrom(this.service.recalculateQuality());
      this.toast.success('تمت إعادة حساب الإحصاءات');
    } catch (error) {
      this.toast.error(errorText(error));
    } finally {
      this.recalculating.set(false);
    }
  }
}
