import { Component, inject, OnInit, signal } from '@angular/core';
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
import { errorText, homeRouteFor, UserService, UserStore } from '@tamam/core';
import { Field } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { AuthShell } from '../../components/auth-shell/auth-shell';
import { Country } from '../../models/country.model';
import { CountriesService } from '../../services/countries.service';

@Component({
  selector: 'tamam-register-page',
  imports: [FormRoot, FormField, RouterLink, Field, AuthShell],
  templateUrl: './register-page.html',
})
export class RegisterPage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly userStore = inject(UserStore);
  private readonly router = inject(Router);
  private readonly countriesService = inject(CountriesService);
  protected readonly countries = signal<Country[]>([]);
  protected readonly countriesState = signal<'loading' | 'ready' | 'error'>('loading');
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
            this.serverError.set(errorText(error, 'تعذر إنشاء الحساب، حاول مرة أخرى'));
          }
        },
      },
    },
  );

  ngOnInit(): void {
    void this.loadCountries();
  }

  protected async loadCountries(): Promise<void> {
    this.countriesState.set('loading');

    try {
      this.countries.set(await firstValueFrom(this.countriesService.getAll()));
      this.countriesState.set('ready');
    } catch {
      this.countriesState.set('error');
    }
  }
}
