import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { errorText, ToastService } from '@tamam/core';
import { Field, Modal } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'tamam-customer-form',
  imports: [Modal, Field, FormRoot, FormField],
  template: `
    <tamam-modal title="تعديل بيانات العميل" (closed)="closed.emit()">
      <form [formRoot]="customerForm" id="customer-form" novalidate>
        @if (serverError(); as message) {
          <div class="alert alert-danger" role="alert">{{ message }}</div>
        }

        <p class="text-secondary small">رقم الهاتف الأساسي <span class="ltr fw-bold">{{ customer().phoneE164 }}</span> لا يمكن تغييره.</p>

        <tamam-field label="الاسم" [field]="customerForm.fullName" [required]="true">
          <input type="text" class="form-control" [formField]="customerForm.fullName" />
        </tamam-field>

        <tamam-field label="هاتف بديل" [field]="customerForm.altPhone">
          <input type="tel" class="form-control" [formField]="customerForm.altPhone" />
        </tamam-field>

        <tamam-field label="هل الرقم عليه واتساب؟" [field]="customerForm.hasWhatsApp">
          <select class="form-select" [formField]="customerForm.hasWhatsApp">
            <option value="">لا أعرف</option>
            <option value="yes">نعم</option>
            <option value="no">لا</option>
          </select>
        </tamam-field>

        <tamam-field label="ملاحظات" [field]="customerForm.notes">
          <textarea class="form-control" rows="3" [formField]="customerForm.notes"></textarea>
        </tamam-field>
      </form>

      <div modal-footer class="d-flex gap-2">
        <button type="button" class="btn btn-light" (click)="closed.emit()">إلغاء</button>
        <button type="submit" form="customer-form" class="btn btn-primary" [disabled]="customerForm().submitting()">حفظ</button>
      </div>
    </tamam-modal>
  `,
})
export class CustomerForm implements OnInit {
  private readonly service = inject(CustomersService);
  private readonly toast = inject(ToastService);

  readonly customer = input.required<Customer>();
  readonly saved = output<void>();
  readonly closed = output<void>();

  protected readonly serverError = signal<string | null>(null);
  private readonly model = signal({ fullName: '', altPhone: '', hasWhatsApp: '', notes: '' });

  protected readonly customerForm = form(
    this.model,
    (path) => {
      required(path.fullName, { message: 'اسم العميل مطلوب' });
      maxLength(path.fullName, 150, { message: 'الاسم طويل جدًا' });
      maxLength(path.altPhone, 20, { message: 'الرقم طويل جدًا' });
      maxLength(path.notes, 500, { message: 'الملاحظات طويلة جدًا' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const value = this.model();

          try {
            await firstValueFrom(
              this.service.update(this.customer().id, {
                fullName: value.fullName.trim(),
                altPhone: value.altPhone.trim() || null,
                hasWhatsApp: value.hasWhatsApp === '' ? null : value.hasWhatsApp === 'yes',
                notes: value.notes.trim() || null,
              }),
            );
            this.toast.success('تم تحديث بيانات العميل');
            this.saved.emit();
          } catch (error) {
            this.serverError.set(errorText(error));
          }
        },
      },
    },
  );

  ngOnInit(): void {
    const current = this.customer();

    this.model.set({
      fullName: current.fullName,
      altPhone: current.altPhoneE164 ?? '',
      hasWhatsApp: current.hasWhatsApp === null ? '' : current.hasWhatsApp ? 'yes' : 'no',
      notes: current.notes ?? '',
    });
  }
}
