import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { errorText, isApiError } from '@tamam/core';
import { DataRequestType, Field, LoadingState, MoneyPipe, PublicLinkPurpose, REJECTION_REASON_LABEL, TamamDatePipe } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { PublicShell } from '../../components/public-shell/public-shell';
import { PublicOrder } from '../../models/public-link.model';
import { PublicLinksService } from '../../services/public-links.service';

type Action = 'confirm' | 'reschedule' | 'cancel' | null;
type Done = 'confirmed' | 'rescheduled' | 'cancelled' | 'optedOut' | 'dataRequested' | null;

@Component({
  selector: 'tamam-confirmation-page',
  imports: [PublicShell, LoadingState, MoneyPipe, TamamDatePipe, Field, FormRoot, FormField],
  templateUrl: './confirmation-page.html',
})
export class ConfirmationPage {
  private readonly service = inject(PublicLinksService);

  /** Bound from the `:token` route parameter. */
  readonly token = input.required<string>();

  protected readonly order = signal<PublicOrder | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<{ title: string; text: string } | null>(null);
  protected readonly action = signal<Action>(null);
  protected readonly done = signal<Done>(null);
  protected readonly serverError = signal<string | null>(null);
  protected readonly reasons = signal<{ id: number; label: string }[]>(
    Object.entries(REJECTION_REASON_LABEL).map(([id, label]) => ({ id: +id, label })),
  );
  protected readonly isSurvey = computed(() => this.order()?.purpose === PublicLinkPurpose.RejectionSurvey);

  private readonly model = signal({ date: '', note: '', reasonId: '1', details: '' });

  protected readonly responseForm = form(
    this.model,
    (path) => {
      maxLength(path.note, 500, { message: 'الملاحظة طويلة جدًا' });
      maxLength(path.details, 1000, { message: 'التفاصيل طويلة جدًا' });
      required(path.date, {
        message: 'اختر التاريخ المناسب لك',
        when: () => this.action() === 'reschedule',
      });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const value = this.model();
          const token = this.token();

          try {
            switch (this.action()) {
              case 'confirm':
                await firstValueFrom(this.service.confirm(token, value.date || null, value.note.trim() || null));
                this.done.set('confirmed');
                break;
              case 'reschedule':
                await firstValueFrom(this.service.reschedule(token, value.date, value.note.trim() || null));
                this.done.set('rescheduled');
                break;
              case 'cancel':
                await firstValueFrom(this.service.cancel(token, Number(value.reasonId), value.details.trim() || null));
                this.done.set('cancelled');
                break;
            }
          } catch (error) {
            this.serverError.set(errorText(error, 'تعذر إرسال ردك، حاول مرة أخرى'));
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

  protected choose(action: Action): void {
    this.serverError.set(null);
    this.model.set({ date: '', note: '', reasonId: '1', details: '' });
    this.action.set(action);
  }

  protected async optOut(): Promise<void> {
    await this.simple(() => this.service.optOut(this.token()), 'optedOut');
  }

  protected async requestData(type: 'access' | 'delete'): Promise<void> {
    await this.simple(
      () => this.service.dataRequest(this.token(), type === 'access' ? DataRequestType.Access : DataRequestType.Delete),
      'dataRequested',
    );
  }

  private async simple(call: () => ReturnType<PublicLinksService['optOut']>, done: Done): Promise<void> {
    this.serverError.set(null);

    try {
      await firstValueFrom(call());
      this.done.set(done);
    } catch (error) {
      this.serverError.set(errorText(error, 'تعذر تنفيذ الطلب، حاول مرة أخرى'));
    }
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
          ? { title: 'انتهت صلاحية الرابط', text: 'هذا الرابط لم يعد صالحًا. تواصل مع المتجر إن كنت تحتاج مساعدة.' }
          : status === 404
            ? { title: 'الرابط غير صحيح', text: 'تأكد من نسخ الرابط كاملًا كما وصلك، أو تواصل مع المتجر.' }
            : { title: 'تعذر فتح الصفحة', text: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى.' },
      );
    } finally {
      this.loading.set(false);
    }
  }
}
