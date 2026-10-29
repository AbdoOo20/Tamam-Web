import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { APP_ENVIRONMENT, errorText, ToastService } from '@tamam/core';
import { Badge, ConfirmService, CopyButton, LoadingState } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { MerchantService } from '../../services/merchant.service';

@Component({
  selector: 'tamam-api-key-tab',
  imports: [Badge, CopyButton, LoadingState],
  templateUrl: './api-key-tab.html',
})
export class ApiKeyTab implements OnInit {
  private readonly service = inject(MerchantService);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  private readonly environment = inject(APP_ENVIRONMENT);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly hasKey = signal(false);
  /** The new key. It is shown only once, right after it is generated. */
  protected readonly newKey = signal<string | null>(null);
  protected readonly example = computed(
    () => `curl -X POST "${this.environment.apiUrl}/integrations/orders" \\
  -H "X-Api-Key: ${this.newKey() ?? 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orderNo": "SHOP-1001",
    "recipientName": "منى أحمد",
    "recipientPhone": "01012345678",
    "addressLine": "12 شارع البحر، الإسكندرية",
    "shippingFee": 40,
    "items": [{ "productName": "قميص قطن", "quantity": 2, "unitPrice": 250 }]
  }'`,
  );

  async ngOnInit(): Promise<void> {
    try {
      this.hasKey.set((await firstValueFrom(this.service.apiKeyStatus())).hasKey);
    } finally {
      this.loading.set(false);
    }
  }

  protected async generate(): Promise<void> {
    if (this.hasKey()) {
      const confirmed = await this.confirmService.confirm({
        title: 'إنشاء مفتاح جديد',
        message: 'سيتوقف المفتاح الحالي فورًا، وعليك تحديثه في كل متجر يستخدمه.',
        confirmText: 'إنشاء مفتاح جديد',
        tone: 'warning',
      });

      if (!confirmed) {
        return;
      }
    }

    this.busy.set(true);

    try {
      this.newKey.set((await firstValueFrom(this.service.generateApiKey())).apiKey);
      this.hasKey.set(true);
    } catch (error) {
      this.toast.error(errorText(error));
    } finally {
      this.busy.set(false);
    }
  }

  protected async revoke(): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'إلغاء المفتاح',
      message: 'سيتوقف الربط مع متجرك فورًا ولن تصل الطلبات تلقائيًا.',
      confirmText: 'إلغاء المفتاح',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await firstValueFrom(this.service.revokeApiKey());
      this.hasKey.set(false);
      this.newKey.set(null);
      this.toast.success('تم إلغاء المفتاح');
    } catch (error) {
      this.toast.error(errorText(error));
    }
  }
}
