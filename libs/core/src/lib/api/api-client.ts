import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';

import { APP_ENVIRONMENT } from '../config/app-environment';
import { SILENT_ERRORS } from '../http/silent-errors';
import { ApiResult, QueryParams } from './api-result.model';

export interface ApiRequestOptions {
  /** Do not show the automatic error toast for this call. */
  silent?: boolean;
}

/**
 * The only place that talks to `HttpClient`. It prefixes the API url and returns
 * `data` from the response envelope, so feature services never deal with the envelope.
 */
@Service()
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly environment = inject(APP_ENVIRONMENT);

  get<T>(path: string, params?: QueryParams, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .get<ApiResult<T>>(this.url(path), {
        params: toHttpParams(params),
        context: toContext(options),
      })
      .pipe(map((result) => result.data as T));
  }

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .post<ApiResult<T>>(this.url(path), body ?? {}, { context: toContext(options) })
      .pipe(map((result) => result.data as T));
  }

  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .put<ApiResult<T>>(this.url(path), body ?? {}, { context: toContext(options) })
      .pipe(map((result) => result.data as T));
  }

  delete<T = void>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .delete<ApiResult<T>>(this.url(path), { context: toContext(options) })
      .pipe(map((result) => result.data as T));
  }

  private url(path: string): string {
    return `${this.environment.apiUrl}/${path.replace(/^\/+/, '')}`;
  }
}

function toHttpParams(params?: QueryParams): HttpParams {
  let httpParams = new HttpParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === null || value === undefined || value === '') {
      continue;
    }

    httpParams = httpParams.set(key, value instanceof Date ? value.toISOString() : String(value));
  }

  return httpParams;
}

function toContext(options?: ApiRequestOptions): HttpContext {
  return new HttpContext().set(SILENT_ERRORS, options?.silent ?? false);
}
