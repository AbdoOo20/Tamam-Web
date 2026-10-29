import { Component, inject, OnInit, signal } from '@angular/core';
import { errorText, ToastService } from '@tamam/core';
import {
  Badge,
  ConfirmService,
  EmptyState,
  LoadingState,
  MERCHANT_STATUS_META,
  MerchantStatus,
  MetaBadge,
  Modal,
  Pagination,
  SearchBox,
  TamamDatePipe,
  TooltipDirective,
} from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { AdminMerchantDetail, AdminMerchantListItem, AdminPlan } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'tamam-merchants-tab',
  imports: [Badge, EmptyState, LoadingState, MetaBadge, Modal, Pagination, SearchBox, TamamDatePipe, TooltipDirective],
  templateUrl: './merchants-tab.html',
})
export class MerchantsTab implements OnInit {
  private readonly service = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly statusOptions = Object.entries(MERCHANT_STATUS_META).map(([id, meta]) => ({ id: +id, label: meta.label }));
  protected readonly items = signal<AdminMerchantListItem[]>([]);
  protected readonly plans = signal<AdminPlan[]>([]);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(0);
  protected readonly totalCount = signal(0);
  protected readonly search = signal('');
  protected readonly status = signal<number | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly selected = signal<AdminMerchantDetail | null>(null);
  protected readonly Status = MerchantStatus;

  async ngOnInit(): Promise<void> {
    await this.load();
    this.plans.set(await firstValueFrom(this.service.plans()).catch(() => []));
  }

  protected async setSearch(value: string): Promise<void> {
    this.search.set(value);
    this.page.set(1);
    await this.load();
  }

  protected async setStatus(event: Event): Promise<void> {
    const value = (event.target as HTMLSelectElement).value;

    this.status.set(value ? Number(value) : null);
    this.page.set(1);
    await this.load();
  }

  protected async goTo(page: number): Promise<void> {
    this.page.set(page);
    await this.load();
  }

  protected async open(merchant: AdminMerchantListItem): Promise<void> {
    try {
      this.selected.set(await firstValueFrom(this.service.merchant(merchant.id)));
    } catch (error) {
      this.toast.error(errorText(error));
    }
  }

  protected async changeStatus(detail: AdminMerchantDetail, status: MerchantStatus): Promise<void> {
    const suspend = status === MerchantStatus.Suspended || status === MerchantStatus.Closed;
    const confirmed = await this.confirmService.confirm({
      title: suspend ? 'إيقاف التاجر' : 'تفعيل التاجر',
      message: suspend
        ? `سيُمنع «${detail.businessName}» من استخدام مفتاح API.`
        : `سيعود «${detail.businessName}» للعمل بشكل طبيعي.`,
      confirmText: 'تأكيد',
      tone: suspend ? 'danger' : 'primary',
    });

    if (!confirmed) {
      return;
    }

    try {
      this.selected.set(await firstValueFrom(this.service.setMerchantStatus(detail.id, status)));
      this.toast.success('تم تحديث حالة التاجر');
      await this.load();
    } catch (error) {
      this.toast.error(errorText(error));
    }
  }

  protected async changePlan(detail: AdminMerchantDetail, event: Event): Promise<void> {
    const planCode = (event.target as HTMLSelectElement).value;

    if (!planCode || planCode === detail.planCode) {
      return;
    }

    try {
      this.selected.set(await firstValueFrom(this.service.setMerchantPlan(detail.id, planCode)));
      this.toast.success('تم تغيير باقة التاجر');
    } catch (error) {
      this.toast.error(errorText(error));
    }
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await firstValueFrom(
        this.service.merchants({
          page: this.page(),
          pageSize: 15,
          search: this.search() || undefined,
          status: this.status() ?? undefined,
        }),
      );

      this.items.set(result.items);
      this.totalPages.set(result.totalPages);
      this.totalCount.set(result.totalCount);
    } catch (error) {
      this.error.set(errorText(error, 'تعذر تحميل التجار'));
    } finally {
      this.loading.set(false);
    }
  }
}
