import { Component, inject, input, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { errorText, homeRouteFor, isApiError, UserService, UserStore } from '@tamam/core';
import { Field } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { AuthShell } from '../../components/auth-shell/auth-shell';

@Component({
  selector: 'tamam-login-page',
  imports: [FormRoot, FormField, RouterLink, Field, AuthShell],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly userService = inject(UserService);
  private readonly userStore = inject(UserStore);
  private readonly router = inject(Router);
  /** Bound from the `?returnUrl=` query parameter. */
  readonly returnUrl = input<string>();
  protected readonly serverError = signal<string | null>(null);
  private readonly model = signal({ email: '', password: '' });
  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.email, { message: 'البريد الإلكتروني مطلوب' });
      email(path.email, { message: 'البريد الإلكتروني غير صالح' });
      required(path.password, { message: 'كلمة المرور مطلوبة' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          try {
            await firstValueFrom(this.userService.login(this.model()));
            await this.router.navigateByUrl(
              this.returnUrl() ?? homeRouteFor(this.userStore.role()),
            );
          } catch (error) {
            this.serverError.set(
              isApiError(error) && error.statusCode === 401
                ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                : errorText(error, 'تعذر تسجيل الدخول، حاول مرة أخرى'),
            );
          }
        },
      },
    },
  );
}
