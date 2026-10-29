import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { errorText, ToastService } from '@tamam/core';
import { Badge, ConfirmService, EmptyState, Field, LoadingState, Modal, TamamDatePipe } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { Staff } from '../../models/merchant.model';
import { MerchantService } from '../../services/merchant.service';

@Component({
  selector: 'tamam-staff-tab',
  imports: [Badge, EmptyState, Field, FormField, FormRoot, LoadingState, Modal, TamamDatePipe],
  templateUrl: './staff-tab.html',
})
export class StaffTab implements OnInit {
  private readonly service = inject(MerchantService);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly loading = signal(true);
  protected readonly staff = signal<Staff[]>([]);
  protected readonly adding = signal(false);
  protected readonly serverError = signal<string | null>(null);
  private readonly model = signal({ fullName: '', email: '', phoneNumber: '', password: '' });
  protected readonly staffForm = form(
    this.model,
    (path) => {
      required(path.fullName, { message: 'الاسم مطلوب' });
      maxLength(path.fullName, 150, { message: 'الاسم طويل جدًا' });
      required(path.email, { message: 'البريد الإلكتروني مطلوب' });
      pattern(path.email, /^\S+@\S+\.\S+$/, { message: 'البريد الإلكتروني غير صالح' });
      maxLength(path.phoneNumber, 20, { message: 'الرقم طويل جدًا' });
      required(path.password, { message: 'كلمة المرور مطلوبة' });
      minLength(path.password, 8, { message: 'كلمة المرور 8 أحرف على الأقل' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const value = this.model();

          try {
            await firstValueFrom(
              this.service.createStaff({
                fullName: value.fullName.trim(),
                email: value.email.trim(),
                phoneNumber: value.phoneNumber.trim() || null,
                password: value.password,
              }),
            );
            this.toast.success('تمت إضافة الموظف');
            this.adding.set(false);
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

  protected open(): void {
    this.serverError.set(null);
    this.model.set({ fullName: '', email: '', phoneNumber: '', password: '' });
    this.adding.set(true);
  }

  protected async remove(member: Staff): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'حذف موظف',
      message: `لن يتمكن «${member.fullName}» من الدخول بعد الآن. هل تريد المتابعة؟`,
      confirmText: 'حذف',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await firstValueFrom(this.service.removeStaff(member.id));
      this.toast.success('تم حذف الموظف');
      await this.load();
    } catch (error) {
      this.toast.error(errorText(error));
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);

    try {
      this.staff.set(await firstValueFrom(this.service.staff()));
    } finally {
      this.loading.set(false);
    }
  }
}
