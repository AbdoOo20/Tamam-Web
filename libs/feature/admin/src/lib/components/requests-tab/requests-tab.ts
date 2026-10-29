import { Component, inject, OnInit, signal } from '@angular/core';
import { errorText, ToastService } from '@tamam/core';
import {
  ConfirmService,
  DATA_REQUEST_STATUS_META,
  DATA_REQUEST_TYPE_LABEL,
  DataRequestStatus,
  DataRequestType,
  EmptyState,
  LoadingState,
  MoneyPipe,
  Modal,
  Pagination,
  TamamDatePipe,
  Badge,
  metaOf,
} from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { CustomerDataExport, DataRequest } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'tamam-requests-tab',
  imports: [Badge, EmptyState, LoadingState, Modal, MoneyPipe, Pagination, TamamDatePipe],
  templateUrl: './requests-tab.html',
})
export class RequestsTab implements OnInit {
  private readonly service = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly typeLabel = DATA_REQUEST_TYPE_LABEL;
  protected readonly Status = DataRequestStatus;
  protected readonly Type = DataRequestType;
  protected readonly statusOptions = Object.entries(DATA_REQUEST_STATUS_META).map(([id, meta]) => ({ id: +id, label: meta.label }));
  protected readonly items = signal<DataRequest[]>([]);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(0);
  protected readonly totalCount = signal(0);
  protected readonly status = signal<number | null>(DataRequestStatus.Open);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly exported = signal<CustomerDataExport | null>(null);

  ngOnInit(): Promise<void> {
    return this.load();
  }

  protected statusMeta(status: number) {
    return metaOf(DATA_REQUEST_STATUS_META, status);
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

  protected async process(request: DataRequest, approve: boolean): Promise<void> {
    const isDelete = request.type === DataRequestType.Delete;
    const confirmed = await this.confirmService.confirm({
      title: approve ? 'تنفيذ الطلب' : 'رفض الطلب',
      message:
        approve && isDelete
          ? 'سيتم إخفاء هوية العميل نهائيًا ولا يمكن التراجع. هل تريد المتابعة؟'
          : approve
            ? 'سيتم تنفيذ الطلب وتسجيله.'
            : 'سيتم رفض الطلب دون تنفيذ.',
      confirmText: approve ? 'تنفيذ' : 'رفض',
      tone: approve && isDelete ? 'danger' : 'primary',
    });

    if (!confirmed) {
      return;
    }

    try {
      await firstValueFrom(this.service.processDataRequest(request.id, approve));
      this.toast.success(approve ? 'تم تنفيذ الطلب' : 'تم رفض الطلب');
      await this.load();
    } catch (error) {
      this.toast.error(errorText(error));
    }
  }

  protected async export(request: DataRequest): Promise<void> {
    try {
      this.exported.set(await firstValueFrom(this.service.exportDataRequest(request.id)));
    } catch (error) {
      this.toast.error(errorText(error));
    }
  }

  protected download(data: CustomerDataExport): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `customer-${data.customerId}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await firstValueFrom(
        this.service.dataRequests({ page: this.page(), pageSize: 15, status: this.status() ?? undefined }),
      );

      this.items.set(result.items);
      this.totalPages.set(result.totalPages);
      this.totalCount.set(result.totalCount);
    } catch (error) {
      this.error.set(errorText(error, 'تعذر تحميل الطلبات'));
    } finally {
      this.loading.set(false);
    }
  }
}
