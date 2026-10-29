import { Component, inject, OnInit, signal } from '@angular/core';
import { Badge, CopyButton, EmptyState, LoadingState } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { MessageTemplate } from '../../models/merchant.model';
import { MerchantService } from '../../services/merchant.service';

@Component({
  selector: 'tamam-templates-tab',
  imports: [Badge, CopyButton, EmptyState, LoadingState],
  template: `
    <p class="text-secondary">قوالب الرسائل التي يستخدمها تمام عند إنشاء رسالة التأكيد. الكلمات بين الأقواس تُستبدل ببيانات الطلب.</p>

    @if (loading()) {
      <tamam-loading variant="skeleton" [rows]="3" />
    } @else if (templates().length === 0) {
      <tamam-empty-state icon="bi-chat-text" title="لا توجد قوالب" />
    } @else {
      <div class="d-grid gap-3">
        @for (template of templates(); track template.id) {
          <div class="border rounded-3 p-3">
            <div class="d-flex flex-wrap justify-content-between gap-2 mb-2">
              <strong class="ltr">{{ template.code }}</strong>
              <tamam-badge tone="info">{{ template.language }}</tamam-badge>
            </div>
            <pre class="mb-2" style="white-space: pre-wrap; font: inherit">{{ template.body }}</pre>
            <tamam-copy-button [value]="template.body" />
          </div>
        }
      </div>
    }
  `,
})
export class TemplatesTab implements OnInit {
  private readonly service = inject(MerchantService);
  protected readonly loading = signal(true);
  protected readonly templates = signal<MessageTemplate[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      this.templates.set(await firstValueFrom(this.service.templates()));
    } finally {
      this.loading.set(false);
    }
  }
}
