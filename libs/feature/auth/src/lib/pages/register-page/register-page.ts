import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  email,
  form,
  FormField,
  FormRoot,
  maxLength,
  minLength,
  required,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { homeRouteFor, isApiError, UserService, UserStore } from '@tamam/core';
import { firstValueFrom } from 'rxjs';

import { CountriesService } from '../../services/countries.service';

@Component({
  selector: 'tamam-register-page',
  imports: [FormRoot, FormField, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: '../auth-form.scss',
})
export class RegisterPage {
  private readonly userService = inject(UserService);
  private readonly userStore = inject(UserStore);
  private readonly router = inject(Router);

  protected readonly countries = toSignal(inject(CountriesService).getAll(), { initialValue: [] });
  protected readonly serverError = signal<string | null>(null);

  private readonly model = signal({
    businessName: '',
    ownerName: '',
    phone: '',
    countryCode: '',
    email: '',
    password: '',
  });

  protected readonly registerForm = form(
    this.model,
    (path) => {
      required(path.businessName, { message: 'اسم النشاط مطلوب' });
      maxLength(path.businessName, 150, { message: 'الاسم طويل جدًا' });
      required(path.ownerName, { message: 'اسم المالك مطلوب' });
      maxLength(path.ownerName, 150, { message: 'الاسم طويل جدًا' });
      required(path.phone, { message: 'رقم الهاتف مطلوب' });
      maxLength(path.phone, 20, { message: 'رقم الهاتف طويل جدًا' });
      required(path.countryCode, { message: 'اختر الدولة' });
      required(path.email, { message: 'البريد الإلكتروني مطلوب' });
      email(path.email, { message: 'البريد الإلكتروني غير صالح' });
      required(path.password, { message: 'كلمة المرور مطلوبة' });
      minLength(path.password, 8, { message: 'كلمة المرور 8 أحرف على الأقل' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          try {
            await firstValueFrom(this.userService.register(this.model()));
            await this.router.navigateByUrl(homeRouteFor(this.userStore.role()));
          } catch (error) {
            this.serverError.set(
              isApiError(error)
                ? [error.message, ...error.errors].join(' - ')
                : 'تعذر إنشاء الحساب، حاول مرة أخرى',
            );
          }
        },
      },
    },
  );
}
