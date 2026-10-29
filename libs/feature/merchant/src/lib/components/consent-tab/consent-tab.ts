import { Component, inject, OnInit, signal } from '@angular/core';
import { errorText, ToastService } from '@tamam/core';
import { LoadingState, TamamDatePipe } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { Consent } from '../../models/merchant.model';
import { MerchantService } from '../../services/merchant.service';

/** Version of the terms shown to the merchant. Change it when the terms change. */
const TERMS_VERSION = '1.0';

@Component({
  selector: 'tamam-consent-tab',
  imports: [LoadingState, TamamDatePipe],
  template: `
    @if (loading()) {
      <tamam-loading variant="skeleton" [rows]="3" />
    } @else {
      <h2 class="h5 fw-bold">مشاركة نتائج الطلبات مع شبكة تمام</h2>
      <p class="text-secondary">
        عند التفعيل، تُشارَك نتيجة طلباتك (تم التسليم أو رُفض) مع الشبكة بشكل مجهول، فتستفيد من سجل العملاء عند غيرك
        ويستفيدون من سجلك. لا تُشارَك أسعار ولا منتجات ولا اسم متجرك. يمكنك تغيير اختيارك في أي وقت.
      </p>

      <div class="form-check form-switch mb-3">
        <input class="form-check-input" type="checkbox" role="switch" id="share" [checked]="share()" (change)="onChange($event)" />
        <label class="form-check-label fw-semibold" for="share">أوافق على المشاركة مع الشبكة</label>
      </div>

      @if (consent(); as current) {
        <p class="small text-secondary">آخر موافقة على الشروط (إصدار {{ current.termsVersion }}): {{ current.acceptedAt | tamamDate: 'datetime' }}</p>
      }

      <button type="button" class="btn btn-primary" [disabled]="saving()" (click)="save()">حفظ الاختيار</button>
    }
  `,
})
export class ConsentTab implements OnInit {
  private readonly service = inject(MerchantService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly consent = signal<Consent | null>(null);
  protected readonly share = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      const consent = await firstValueFrom(this.service.consent());

      this.consent.set(consent);
      this.share.set(consent.shareOutcomesToNetwork);
    } catch {
      // No consent saved yet: the switch starts off.
    } finally {
      this.loading.set(false);
    }
  }

  protected onChange(event: Event): void {
    this.share.set((event.target as HTMLInputElement).checked);
  }

  protected async save(): Promise<void> {
    this.saving.set(true);

    try {
      this.consent.set(await firstValueFrom(this.service.acceptConsent(TERMS_VERSION, this.share())));
      this.toast.success('تم حفظ اختيارك');
    } catch (error) {
      this.toast.error(errorText(error));
    } finally {
      this.saving.set(false);
    }
  }
}
