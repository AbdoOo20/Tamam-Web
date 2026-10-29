import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, pattern, required } from '@angular/forms/signals';
import { errorText, ToastService } from '@tamam/core';
import { Field, LoadingState } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { MerchantService } from '../../services/merchant.service';

@Component({
  selector: 'tamam-profile-tab',
  imports: [FormRoot, FormField, Field, LoadingState],
  template: `
    @if (loading()) {
      <tamam-loading variant="skeleton" [rows]="6" />
    } @else {
      <form [formRoot]="profileForm" novalidate>
        @if (serverError(); as message) {
          <div class="alert alert-danger" role="alert">{{ message }}</div>
        }

        <div class="row">
          <div class="col-md-6">
            <tamam-field label="اسم النشاط" [field]="profileForm.businessName" [required]="true">
              <input type="text" class="form-control" [formField]="profileForm.businessName" />
            </tamam-field>
          </div>
          <div class="col-md-6">
            <tamam-field label="اسم المالك" [field]="profileForm.ownerName" [required]="true">
              <input type="text" class="form-control" [formField]="profileForm.ownerName" />
            </tamam-field>
          </div>
          <div class="col-md-6">
            <tamam-field label="الهاتف" [field]="profileForm.phone" [required]="true">
              <input type="tel" class="form-control" [formField]="profileForm.phone" />
            </tamam-field>
          </div>
          <div class="col-md-6">
            <tamam-field label="البريد الإلكتروني" [field]="profileForm.email">
              <input type="email" class="form-control" [formField]="profileForm.email" />
            </tamam-field>
          </div>
          <div class="col-md-6">
            <tamam-field label="رابط المتجر" [field]="profileForm.storeUrl">
              <input type="url" class="form-control" [formField]="profileForm.storeUrl" />
            </tamam-field>
          </div>
          <div class="col-md-6">
            <tamam-field label="حساب إنستجرام" [field]="profileForm.instagramHandle">
              <input type="text" class="form-control ltr" [formField]="profileForm.instagramHandle" />
            </tamam-field>
          </div>
        </div>

        <div class="form-check form-switch mb-1">
          <input class="form-check-input" type="checkbox" role="switch" id="shadow-mode" [formField]="profileForm.shadowMode" />
          <label class="form-check-label fw-semibold" for="shadow-mode">الوضع التجريبي</label>
        </div>
        <p class="form-text mb-4">في الوضع التجريبي تُحسب تقييمات المخاطر وتظهر لك، لكنها لا تُسجَّل كتوصيات تؤثر على عملك. مناسب لتجربة الخدمة قبل الاعتماد عليها.</p>

        <button type="submit" class="btn btn-primary" [disabled]="profileForm().submitting()">حفظ التغييرات</button>
      </form>
    }
  `,
})
export class ProfileTab implements OnInit {
  private readonly service = inject(MerchantService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly serverError = signal<string | null>(null);

  private readonly model = signal({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    storeUrl: '',
    instagramHandle: '',
    shadowMode: false,
    defaultLanguage: 'ar-EG',
  });

  protected readonly profileForm = form(
    this.model,
    (path) => {
      required(path.businessName, { message: 'اسم النشاط مطلوب' });
      maxLength(path.businessName, 150, { message: 'الاسم طويل جدًا' });
      required(path.ownerName, { message: 'اسم المالك مطلوب' });
      maxLength(path.ownerName, 150, { message: 'الاسم طويل جدًا' });
      required(path.phone, { message: 'الهاتف مطلوب' });
      maxLength(path.phone, 20, { message: 'الرقم طويل جدًا' });
      pattern(path.email, /^$|^\S+@\S+\.\S+$/, { message: 'البريد الإلكتروني غير صالح' });
      pattern(path.storeUrl, /^(https?:\/\/.*)?$/, { message: 'يجب أن يبدأ الرابط بـ http أو https' });
      maxLength(path.storeUrl, 300, { message: 'الرابط طويل جدًا' });
      maxLength(path.instagramHandle, 100, { message: 'الاسم طويل جدًا' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const value = this.model();

          try {
            await firstValueFrom(
              this.service.updateProfile({
                businessName: value.businessName.trim(),
                ownerName: value.ownerName.trim(),
                phone: value.phone.trim(),
                email: value.email.trim() || null,
                defaultLanguage: value.defaultLanguage,
                storeUrl: value.storeUrl.trim() || null,
                instagramHandle: value.instagramHandle.trim() || null,
                shadowMode: value.shadowMode,
              }),
            );
            this.toast.success('تم حفظ بيانات المتجر');
          } catch (error) {
            this.serverError.set(errorText(error));
          }
        },
      },
    },
  );

  async ngOnInit(): Promise<void> {
    try {
      const profile = await firstValueFrom(this.service.profile());

      this.model.set({
        businessName: profile.businessName,
        ownerName: profile.ownerName,
        phone: profile.phone,
        email: profile.email ?? '',
        storeUrl: profile.storeUrl ?? '',
        instagramHandle: profile.instagramHandle ?? '',
        shadowMode: profile.shadowMode,
        defaultLanguage: profile.defaultLanguage,
      });
    } finally {
      this.loading.set(false);
    }
  }
}
