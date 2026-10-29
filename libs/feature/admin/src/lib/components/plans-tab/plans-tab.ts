import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, FormRoot, max, maxLength, min, required } from '@angular/forms/signals';
import { errorText, ToastService } from '@tamam/core';
import { Badge, EmptyState, Field, LoadingState, Modal, MoneyPipe } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { AdminPlan } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'tamam-plans-tab',
  imports: [Badge, EmptyState, Field, FormField, FormRoot, LoadingState, Modal, MoneyPipe],
  templateUrl: './plans-tab.html',
})
export class PlansTab implements OnInit {
  private readonly service = inject(AdminService);
  private readonly toast = inject(ToastService);
  protected readonly plans = signal<AdminPlan[]>([]);
  protected readonly loading = signal(true);
  /** `undefined` = closed, `null` = new plan, a plan = editing it. */
  protected readonly editing = signal<AdminPlan | null | undefined>(undefined);
  protected readonly serverError = signal<string | null>(null);
  private readonly model = signal({
    code: '',
    nameAr: '',
    monthlyFee: 0,
    pricePerCheckedOrder: 0,
    includedOrders: 0,
    currencyCode: 'USD',
    isActive: true,
  });
  protected readonly planForm = form(
    this.model,
    (path) => {
      required(path.code, { message: 'الكود مطلوب' });
      maxLength(path.code, 30, { message: 'الكود طويل جدًا' });
      required(path.nameAr, { message: 'الاسم مطلوب' });
      maxLength(path.nameAr, 100, { message: 'الاسم طويل جدًا' });
      required(path.currencyCode, { message: 'العملة مطلوبة' });
      maxLength(path.currencyCode, 3, { message: 'رمز العملة 3 أحرف' });
      min(path.monthlyFee, 0, { message: 'لا يمكن أن تكون القيمة سالبة' });
      min(path.pricePerCheckedOrder, 0, { message: 'لا يمكن أن تكون القيمة سالبة' });
      min(path.includedOrders, 0, { message: 'لا يمكن أن تكون القيمة سالبة' });
      max(path.includedOrders, 100000000, { message: 'القيمة كبيرة جدًا' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const value = this.model();
          const request = {
            code: value.code.trim(),
            nameAr: value.nameAr.trim(),
            monthlyFee: value.monthlyFee || 0,
            pricePerCheckedOrder: value.pricePerCheckedOrder || 0,
            includedOrders: value.includedOrders || 0,
            currencyCode: value.currencyCode.trim().toUpperCase(),
            isActive: value.isActive,
          };

          try {
            const current = this.editing();

            await firstValueFrom(
              current ? this.service.updatePlan(current.id, request) : this.service.createPlan(request),
            );
            this.toast.success('تم حفظ الباقة');
            this.editing.set(undefined);
            await this.load();
          } catch (error) {
            this.serverError.set(errorText(error));
          }
        },
      },
    },
  );

  ngOnInit(): Promise<void> {
    return this.load();
  }

  protected open(plan: AdminPlan | null): void {
    this.serverError.set(null);
    this.model.set(
      plan
        ? { ...plan }
        : { code: '', nameAr: '', monthlyFee: 0, pricePerCheckedOrder: 0, includedOrders: 0, currencyCode: 'USD', isActive: true },
    );
    this.editing.set(plan);
  }

  private async load(): Promise<void> {
    this.loading.set(true);

    try {
      this.plans.set(await firstValueFrom(this.service.plans()));
    } finally {
      this.loading.set(false);
    }
  }
}
