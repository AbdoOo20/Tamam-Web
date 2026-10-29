import { Component, inject, OnInit, signal } from '@angular/core';
import { errorText } from '@tamam/core';
import { EmptyState, LoadingState, Pagination, TamamDatePipe, TooltipDirective } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { AdminAuditLog } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'tamam-admin-audit-tab',
  imports: [EmptyState, LoadingState, Pagination, TamamDatePipe, TooltipDirective],
  template: `
    @if (loading() && items().length === 0) {
      <tamam-loading variant="skeleton" [rows]="6" />
    } @else if (error(); as message) {
      <tamam-empty-state icon="bi-wifi-off" title="تعذر التحميل" [description]="message">
        <button type="button" class="btn btn-primary" (click)="load()">إعادة المحاولة</button>
      </tamam-empty-state>
    } @else if (items().length === 0) {
      <tamam-empty-state icon="bi-journal-text" title="لا توجد سجلات" />
    } @else {
      <div class="table-responsive">
        <table class="table tm-table">
          <thead>
            <tr><th scope="col">الوقت</th><th scope="col">التاجر</th><th scope="col">المستخدم</th><th scope="col">العملية</th><th scope="col">العنصر</th><th scope="col">IP</th></tr>
          </thead>
          <tbody>
            @for (log of items(); track log.id) {
              <tr>
                <td class="text-nowrap">{{ log.createdAt | tamamDate: 'datetime' }}</td>
                <td class="ltr">{{ log.merchantId ?? '—' }}</td>
                <td style="max-width: 12rem"><span tamamTooltip>{{ log.userName || 'النظام' }}</span></td>
                <td>{{ log.action }}</td>
                <td>{{ log.entityName }} <span class="text-secondary ltr">#{{ log.entityId }}</span></td>
                <td class="ltr text-secondary">{{ log.ipAddress || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <tamam-pagination [page]="page()" [totalPages]="totalPages()" [totalCount]="totalCount()" (pageChange)="goTo($event)" />
    }
  `,
})
export class AdminAuditTab implements OnInit {
  private readonly service = inject(AdminService);

  protected readonly items = signal<AdminAuditLog[]>([]);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(0);
  protected readonly totalCount = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): Promise<void> {
    return this.load();
  }

  protected async goTo(page: number): Promise<void> {
    this.page.set(page);
    await this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await firstValueFrom(this.service.auditLogs({ page: this.page(), pageSize: 20 }));

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
