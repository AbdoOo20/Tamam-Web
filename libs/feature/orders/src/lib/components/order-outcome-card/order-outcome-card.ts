import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { form, FormField, FormRoot, max, maxLength, min, pattern } from '@angular/forms/signals';
import { errorText, ToastService } from '@tamam/core';
import {
  Badge,
  CopyButton,
  Field,
  FINAL_RESULT_LABEL,
  MetaBadge,
  Modal,
  MoneyPipe,
  OrderStatus,
  REJECTION_REASON_LABEL,
  TamamDatePipe,
} from '@tamam/shared';
import { catchError, firstValueFrom, of } from 'rxjs';

import { OrderDetail, OrderOutcome, RejectionReport } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailStore } from '../../store/order-detail.store';

/** Rejection reports, who is at fault, and the loss of a refused order. */
@Component({
  selector: 'tamam-order-outcome-card',
  imports: [Badge, CopyButton, Field, FormRoot, FormField, MetaBadge, Modal, MoneyPipe, TamamDatePipe],
  templateUrl: './order-outcome-card.html',
})
export class OrderOutcomeCard {
  private readonly service = inject(OrdersService);
  private readonly store = inject(OrderDetailStore);
  private readonly toast = inject(ToastService);

  readonly order = input.required<OrderDetail>();

  protected readonly reasons = Object.entries(REJECTION_REASON_LABEL).map(([value, label]) => ({ value, label }));
  protected readonly reasonLabel = REJECTION_REASON_LABEL;
  protected readonly resultLabel = FINAL_RESULT_LABEL;

  protected readonly reports = signal<RejectionReport[]>([]);
  protected readonly outcome = signal<OrderOutcome | null>(null);
  protected readonly reporting = signal(false);
  protected readonly editingLoss = signal(false);
  protected readonly serverError = signal<string | null>(null);

  /** The merchant can report a reason only after the order was refused or returned. */
  protected readonly canReport = computed(
    () => ([OrderStatus.Refused, OrderStatus.Returned] as number[]).includes(this.order().statusId),
  );
  protected readonly visible = computed(
    () =>
      this.canReport() ||
      this.order().statusId === OrderStatus.FailedDelivery ||
      this.reports().length > 0 ||
      this.outcome() !== null,
  );

  private readonly reasonModel = signal({ reasonId: '1', details: '', evidenceUrl: '' });
  private readonly lossModel = signal({ outboundShippingCost: 0, returnShippingCost: 0, otherLoss: 0 });

  protected readonly reasonForm = form(
    this.reasonModel,
    (path) => {
      maxLength(path.details, 1000, { message: 'التفاصيل طويلة جدًا' });
      maxLength(path.evidenceUrl, 500, { message: 'الرابط طويل جدًا' });
      pattern(path.evidenceUrl, /^(https?:\/\/.*)?$/, { message: 'يجب أن يبدأ الرابط بـ http أو https' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const value = this.reasonModel();

          try {
            await firstValueFrom(
              this.service.reportRejection({
                orderId: this.order().id,
                reasonId: Number(value.reasonId),
                details: value.details.trim() || null,
                evidenceUrl: value.evidenceUrl.trim() || null,
              }),
            );
            this.toast.success('تم تسجيل سبب الرفض');
            this.reporting.set(false);
            await Promise.all([this.load(), this.store.refresh()]);
          } catch (error) {
            this.serverError.set(errorText(error));
          }
        },
      },
    },
  );

  protected readonly lossForm = form(
    this.lossModel,
    (path) => {
      for (const field of [path.outboundShippingCost, path.returnShippingCost, path.otherLoss]) {
        min(field, 0, { message: 'لا يمكن أن تكون القيمة سالبة' });
        max(field, 100000000, { message: 'القيمة كبيرة جدًا' });
      }
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const value = this.lossModel();

          try {
            this.outcome.set(
              await firstValueFrom(
                this.service.updateLoss(this.order().id, {
                  outboundShippingCost: value.outboundShippingCost || 0,
                  returnShippingCost: value.returnShippingCost || 0,
                  otherLoss: value.otherLoss || 0,
                }),
              ),
            );
            this.toast.success('تم تحديث الخسارة');
            this.editingLoss.set(false);
          } catch (error) {
            this.serverError.set(errorText(error));
          }
        },
      },
    },
  );

  constructor() {
    effect(() => {
      this.order().statusId;
      untracked(() => void this.load());
    });
  }

  protected openReport(): void {
    this.serverError.set(null);
    this.reasonModel.set({ reasonId: '1', details: '', evidenceUrl: '' });
    this.reporting.set(true);
  }

  protected openLoss(): void {
    const current = this.outcome();

    this.serverError.set(null);
    this.lossModel.set({
      outboundShippingCost: current?.outboundShippingCost ?? 0,
      returnShippingCost: current?.returnShippingCost ?? 0,
      otherLoss: current?.otherLoss ?? 0,
    });
    this.editingLoss.set(true);
  }

  private async load(): Promise<void> {
    const id = this.order().id;

    this.reports.set(await firstValueFrom(this.service.rejections(id).pipe(catchError(() => of([])))));
    this.outcome.set(await firstValueFrom(this.service.outcome(id).pipe(catchError(() => of(null)))));
  }
}
