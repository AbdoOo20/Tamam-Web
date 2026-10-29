import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required, pattern } from '@angular/forms/signals';
import { errorText, ToastService } from '@tamam/core';
import { Field, Modal } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { Carrier } from '../../models/carrier.model';
import { CarriersService } from '../../services/carriers.service';

@Component({
  selector: 'tamam-carrier-form',
  imports: [Modal, Field, FormRoot, FormField],
  template: `
    <tamam-modal [title]="carrier() ? 'تعديل شركة الشحن' : 'إضافة شركة شحن'" (closed)="closed.emit()">
      <form [formRoot]="carrierForm" id="carrier-form" novalidate>
        @if (serverError(); as message) {
          <div class="alert alert-danger" role="alert">{{ message }}</div>
        }

        <tamam-field label="اسم الشركة" [field]="carrierForm.name" [required]="true">
          <input type="text" class="form-control" [formField]="carrierForm.name" />
        </tamam-field>

        <tamam-field label="هاتف الشركة" [field]="carrierForm.phone">
          <input type="tel" class="form-control" [formField]="carrierForm.phone" />
        </tamam-field>

        <tamam-field
          label="رابط التتبع"
          [field]="carrierForm.trackingUrlTemplate"
          hint="اكتب {tracking} مكان رقم الشحنة، مثال: https://carrier.com/track/{tracking}"
        >
          <input type="url" class="form-control" [formField]="carrierForm.trackingUrlTemplate" />
        </tamam-field>

        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="carrier-active" [formField]="carrierForm.isActive" />
          <label class="form-check-label" for="carrier-active">شركة نشطة</label>
        </div>
      </form>

      <div modal-footer class="d-flex gap-2">
        <button type="button" class="btn btn-light" (click)="closed.emit()">إلغاء</button>
        <button type="submit" form="carrier-form" class="btn btn-primary" [disabled]="carrierForm().submitting()">حفظ</button>
      </div>
    </tamam-modal>
  `,
})
export class CarrierForm implements OnInit {
  private readonly service = inject(CarriersService);
  private readonly toast = inject(ToastService);
  /** The carrier being edited; leave empty to add a new one. */
  readonly carrier = input<Carrier | null>(null);
  readonly saved = output<void>();
  readonly closed = output<void>();
  protected readonly serverError = signal<string | null>(null);
  private readonly model = signal({ name: '', phone: '', trackingUrlTemplate: '', isActive: true });
  protected readonly carrierForm = form(
    this.model,
    (path) => {
      required(path.name, { message: 'اسم الشركة مطلوب' });
      maxLength(path.name, 100, { message: 'الاسم طويل جدًا' });
      maxLength(path.phone, 20, { message: 'الرقم طويل جدًا' });
      maxLength(path.trackingUrlTemplate, 300, { message: 'الرابط طويل جدًا' });
      pattern(path.trackingUrlTemplate, /^(https?:\/\/.*)?$/, { message: 'يجب أن يبدأ الرابط بـ http أو https' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const value = this.model();
          const request = {
            name: value.name.trim(),
            phone: value.phone.trim() || null,
            trackingUrlTemplate: value.trackingUrlTemplate.trim() || null,
            isActive: value.isActive,
          };

          try {
            const current = this.carrier();

            await firstValueFrom(
              current ? this.service.update(current.id, request) : this.service.create(request),
            );
            this.toast.success(current ? 'تم تحديث شركة الشحن' : 'تمت إضافة شركة الشحن');
            this.saved.emit();
          } catch (error) {
            this.serverError.set(errorText(error));
          }
        },
      },
    },
  );

  ngOnInit(): void {
    const current = this.carrier();

    if (current) {
      this.model.set({
        name: current.name,
        phone: current.phone ?? '',
        trackingUrlTemplate: current.trackingUrlTemplate ?? '',
        isActive: current.isActive,
      });
    }
  }
}
