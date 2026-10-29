import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { APP_ENVIRONMENT } from '../config/app-environment';
import { UserStore } from '../auth/user.store';

/** Adds the access token to every request that goes to our API. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const environment = inject(APP_ENVIRONMENT);
  const token = inject(UserStore).accessToken();

  if (!token || !request.url.startsWith(environment.apiUrl)) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
