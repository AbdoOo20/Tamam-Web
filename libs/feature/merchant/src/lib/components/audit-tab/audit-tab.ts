import { Component, inject, OnInit, signal } from '@angular/core';
import { errorText } from '@tamam/core';
import { Badge, EmptyState, LoadingState, Pagination, TamamDatePipe, TooltipDirective } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { AuditLog } from '../../models/merchant.model';
import { MerchantService } from '../../services/merchant.service';

const ENTITY_LABEL: Record<string, string> = {
  Order: 'طلب',
  Product: 'منتج',
  Carrier: 'شركة شحن',
  Customer: 'عميل',
  Merchant: 'المتجر',
  User: 'مستخدم',
  Subscription: 'اشتراك',
  MerchantApiKey: 'مفتاح API',
};

const ACTION_LABEL: Record<string, string> = { Create: 'إنشاء', Update: 'تعديل', Delete: 'حذف' };

@Component({
  selector: 'tamam-audit-tab',
  imports: [Badge, EmptyState, LoadingState, Pagination, TamamDatePipe, TooltipDirective],
  templateUrl: './audit-tab.html',
})
export class AuditTab implements OnInit {
  private readonly service = inject(MerchantService);
  protected readonly entities = Object.entries(ENTITY_LABEL);
  protected readonly actions = Object.entries(ACTION_LABEL);
  protected readonly items = signal<AuditLog[]>([]);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(0);
  protected readonly totalCount = signal(0);
  protected readonly entityName = signal('');
  protected readonly action = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly expanded = signal<number | null>(null);

  ngOnInit(): Promise<void> {
    return this.load();
  }

  protected entityLabel(name: string): string {
    return ENTITY_LABEL[name] ?? name;
  }

  protected actionLabel(name: string): string {
    return ACTION_LABEL[name] ?? name;
  }

  protected actionTone(name: string): 'success' | 'info' | 'danger' | 'secondary' {
    return name === 'Create' ? 'success' : name === 'Update' ? 'info' : name === 'Delete' ? 'danger' : 'secondary';
  }

  protected pretty(json: string | null): string {
    if (!json) {
      return '';
    }

    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  }

  protected toggle(id: number): void {
    this.expanded.update((current) => (current === id ? null : id));
  }

  protected async filter(key: 'entityName' | 'action', event: Event): Promise<void> {
    (key === 'entityName' ? this.entityName : this.action).set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    await this.load();
  }

  protected async goTo(page: number): Promise<void> {
    this.page.set(page);
    await this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await firstValueFrom(
        this.service.auditLogs({
          page: this.page(),
          pageSize: 15,
          entityName: this.entityName() || undefined,
          action: this.action() || undefined,
        }),
      );

      this.items.set(result.items);
      this.totalPages.set(result.totalPages);
      this.totalCount.set(result.totalCount);
    } catch (error) {
      this.error.set(errorText(error, 'تعذر تحميل السجل'));
    } finally {
      this.loading.set(false);
    }
  }
}
