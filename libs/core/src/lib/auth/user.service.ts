import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { ApiClient } from '../api/api-client';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from './models/auth.models';
import { UserStore } from './user.store';

/** Talks to `/auth/*` and keeps the `UserStore` in sync. */
@Service()
export class UserService {
  private readonly api = inject(ApiClient);
  private readonly store = inject(UserStore);
  private readonly router = inject(Router);

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>('auth/login', request, { silent: true })
      .pipe(tap((response) => this.store.setSession(response)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>('auth/register', request, { silent: true })
      .pipe(tap((response) => this.store.setSession(response)));
  }

  /** Asks the server who the token belongs to. */
  me(): Observable<CurrentUser> {
    return this.api.get<CurrentUser>('auth/me');
  }

  logout(): void {
    this.store.clear();
    void this.router.navigate(['/auth/login']);
  }
}
