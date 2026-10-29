import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { form, FormField, FormRoot, maxLength } from '@angular/forms/signals';
import { errorText, isApiError } from '@tamam/core';
import { Field, LoadingState, REJECTION_REASON_LABEL } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { PublicShell } from '../../components/public-shell/public-shell';
import { PublicOrder } from '../../models/public-link.model';
import { PublicLinksService } from '../../services/public-links.service';

@Component({
  selector: 'tamam-survey-page',
  imports: [PublicShell, LoadingState, Field, FormRoot, FormField],
  templateUrl: './survey-page.html',
})
export class SurveyPage {
  private readonly service = inject(PublicLinksService);
  /** Bound from the `:token` route parameter. */
  readonly token = input.required<string>();
  protected readonly order = signal<PublicOrder | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<{ title: string; text: string } | null>(null);
  protected readonly done = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly reasons = signal<{ id: number; label: string }[]>(
    Object.entries(REJECTION_REASON_LABEL).map(([id, label]) => ({ id: +id, label })),
  );
  private readonly model = signal({ reasonId: '1', details: '' });
  protected readonly surveyForm = form(
    this.model,
    (path) => {
      maxLength(path.details, 1000, { message: 'التفاصيل طويلة جدًا' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const value = this.model();

          try {
            await firstValueFrom(this.service.survey(this.token(), Number(value.reasonId), value.details.trim() || null));
            this.done.set(true);
          } catch (error) {
            this.serverError.set(errorText(error, 'تعذر إرسال إجابتك، حاول مرة أخرى'));
          }
        },
      },
    },
  );

  constructor() {
    effect(() => {
      const token = this.token();

      untracked(() => void this.load(token));
    });
  }

  private async load(token: string): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);

    try {
      this.order.set(await firstValueFrom(this.service.get(token)));

      const reasons = await firstValueFrom(this.service.reasons()).catch(() => []);

      if (reasons.length > 0) {
        this.reasons.set(reasons.sort((a, b) => a.sortOrder - b.sortOrder).map((r) => ({ id: r.id, label: r.nameAr })));
      }
    } catch (error) {
      const status = isApiError(error) ? error.statusCode : 0;

      this.loadError.set(
        status === 410
          ? { title: 'انتهت صلاحية الرابط', text: 'هذا الاستبيان لم يعد متاحًا.' }
          : status === 404
            ? { title: 'الرابط غير صحيح', text: 'تأكد من نسخ الرابط كاملًا كما وصلك.' }
            : { title: 'تعذر فتح الصفحة', text: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى.' },
      );
    } finally {
      this.loading.set(false);
    }
  }
}
