import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, FormRoot, max, maxLength, min, required } from '@angular/forms/signals';
import { errorText, ToastService } from '@tamam/core';
import { Badge, EmptyState, Field, LoadingState, Modal, TooltipDirective } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { AdminRiskRule } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'tamam-rules-tab',
  imports: [Badge, EmptyState, Field, FormField, FormRoot, LoadingState, Modal, TooltipDirective],
  templateUrl: './rules-tab.html',
})
export class RulesTab implements OnInit {
  private readonly service = inject(AdminService);
  private readonly toast = inject(ToastService);
  protected readonly rules = signal<AdminRiskRule[]>([]);
  protected readonly loading = signal(true);
  protected readonly editing = signal<AdminRiskRule | null>(null);
  protected readonly serverError = signal<string | null>(null);
  private readonly model = signal({ nameAr: '', explanationTemplateAr: '', points: 0, isActive: true });
  protected readonly ruleForm = form(
    this.model,
    (path) => {
      required(path.nameAr, { message: 'الاسم مطلوب' });
      maxLength(path.nameAr, 200, { message: 'الاسم طويل جدًا' });
      required(path.explanationTemplateAr, { message: 'نص الشرح مطلوب' });
      maxLength(path.explanationTemplateAr, 300, { message: 'النص طويل جدًا (300 حرف)' });
      min(path.points, -100, { message: 'أقل قيمة -100' });
      max(path.points, 100, { message: 'أعلى قيمة 100' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const current = this.editing();
          const value = this.model();

          if (!current) {
            return;
          }

          try {
            await firstValueFrom(
              this.service.updateRiskRule(current.id, {
                nameAr: value.nameAr.trim(),
                explanationTemplateAr: value.explanationTemplateAr.trim(),
                points: value.points || 0,
                isActive: value.isActive,
              }),
            );
            this.toast.success('تم تحديث القاعدة');
            this.editing.set(null);
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

  protected open(rule: AdminRiskRule): void {
    this.serverError.set(null);
    this.model.set({
      nameAr: rule.nameAr,
      explanationTemplateAr: rule.explanationTemplateAr,
      points: rule.points,
      isActive: rule.isActive,
    });
    this.editing.set(rule);
  }

  private async load(): Promise<void> {
    this.loading.set(true);

    try {
      this.rules.set(await firstValueFrom(this.service.riskRules()));
    } finally {
      this.loading.set(false);
    }
  }
}
