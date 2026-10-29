import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { ApiClient } from '../api/api-client';
import { ApiError } from '../api/api-error';
import { AuthResponse } from '../auth/models/auth.models';
import { UserStore } from '../auth/user.store';
import { APP_ENVIRONMENT } from '../config/app-environment';
import { ToastService } from '../notifications/toast.service';
import { TEST_ENVIRONMENT } from '../testing/test-environment';
import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';

const session: AuthResponse = {
  accessToken: 'jwt-token',
  expiresAtUtc: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  userId: 1,
  merchantId: 10,
  fullName: 'Ahmed',
  role: 'Owner',
};

describe('http interceptors', () => {
  let http: HttpTestingController;
  let api: ApiClient;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_ENVIRONMENT, useValue: TEST_ENVIRONMENT },
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(ApiClient);
  });

  afterEach(() => http.verify());

  it('unwraps data from the response envelope', () => {
    let result: unknown;

    api.get<{ id: number }>('orders/5').subscribe((data) => (result = data));
    http
      .expectOne('https://api.test/api/orders/5')
      .flush({ succeeded: true, statusCode: 200, message: null, errors: [], data: { id: 5 } });

    expect(result).toEqual({ id: 5 });
  });

  it('sends the bearer token to the API only', () => {
    TestBed.inject(UserStore).setSession(session);

    api.get('orders').subscribe();
    TestBed.inject(HttpClient).get('https://other.site/file').subscribe();

    expect(http.expectOne('https://api.test/api/orders').request.headers.get('Authorization')).toBe(
      'Bearer jwt-token',
    );
    expect(http.expectOne('https://other.site/file').request.headers.has('Authorization')).toBe(
      false,
    );
  });

  it('maps a failed response to ApiError', () => {
    let error: unknown;

    api.get('orders/9').subscribe({ error: (e: unknown) => (error = e) });
    http
      .expectOne('https://api.test/api/orders/9')
      .flush(
        {
          succeeded: false,
          statusCode: 404,
          message: 'Order was not found.',
          errors: [],
          data: null,
        },
        { status: 404, statusText: 'Not Found' },
      );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(404);
    expect((error as ApiError).message).toBe('Order was not found.');
  });

  it('ends the session and goes to the login page on 401', async () => {
    const store = TestBed.inject(UserStore);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    store.setSession(session);
    api.get('orders').subscribe({ error: () => undefined });
    http
      .expectOne('https://api.test/api/orders')
      .flush({ message: 'Unauthorized.', errors: [] }, { status: 401, statusText: 'Unauthorized' });

    expect(store.isLoggedIn()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/auth/login'], expect.anything());
    expect(TestBed.inject(ToastService).toasts()).toHaveLength(1);
  });

  it('does not show a toast for a 400 error', () => {
    api.post('orders', {}).subscribe({ error: () => undefined });
    http
      .expectOne('https://api.test/api/orders')
      .flush(
        { message: 'Bad request.', errors: ['x'] },
        { status: 400, statusText: 'Bad Request' },
      );

    expect(TestBed.inject(ToastService).toasts()).toHaveLength(0);
  });
});
