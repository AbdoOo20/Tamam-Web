import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ApiError } from '../api/api-error';
import { ApiResult } from '../api/api-result.model';
import { UserStore } from '../auth/user.store';
import { ToastService } from '../notifications/toast.service';
import { HTTP_MESSAGES } from './messages';
import { SILENT_ERRORS } from './silent-errors';

/**
 * Turns every failed response into an `ApiError`, ends the session on 401,
 * and shows a toast for the errors the user cannot fix from a form.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const store = inject(UserStore);
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const apiError = toApiError(error);
      const silent = request.context.get(SILENT_ERRORS);

      if (apiError.statusCode === 401 && store.isLoggedIn()) {
        store.clear();
        void router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } });

        if (!silent) {
          toast.error(HTTP_MESSAGES.sessionExpired);
        }
      } else if (!silent) {
        const message = messageFor(apiError.statusCode);

        if (message) {
          toast.error(message);
        }
      }

      return throwError(() => apiError);
    }),
  );
};

function toApiError(error: HttpErrorResponse): ApiError {
  const body =
    typeof error.error === 'object' && error.error !== null
      ? (error.error as Partial<ApiResult<unknown>>)
      : null;

  return new ApiError(error.status, body?.message ?? HTTP_MESSAGES.unknown, body?.errors ?? []);
}

function messageFor(status: number): string | null {
  if (status === 0) {
    return HTTP_MESSAGES.network;
  }

  if (status === 403) {
    return HTTP_MESSAGES.forbidden;
  }

  if (status === 429) {
    return HTTP_MESSAGES.tooManyRequests;
  }

  return status >= 500 ? HTTP_MESSAGES.server : null;
}
