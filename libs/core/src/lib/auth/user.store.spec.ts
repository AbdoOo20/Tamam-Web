import { TestBed } from '@angular/core/testing';

import { APP_ENVIRONMENT } from '../config/app-environment';
import { TEST_ENVIRONMENT } from '../testing/test-environment';
import { AuthResponse } from './models/auth.models';
import { RoleNames } from './role-names';
import { UserStore } from './user.store';

function response(overrides: Partial<AuthResponse> = {}): AuthResponse {
  return {
    accessToken: 'token',
    expiresAtUtc: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    userId: 1,
    merchantId: 10,
    fullName: 'Ahmed',
    role: RoleNames.Owner,
    ...overrides,
  };
}

describe('UserStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: TEST_ENVIRONMENT }],
    });
  });

  it('exposes the signed-in user', () => {
    const store = TestBed.inject(UserStore);

    store.setSession(response());

    expect(store.isLoggedIn()).toBe(true);
    expect(store.isOwner()).toBe(true);
    expect(store.merchantId()).toBe(10);
    expect(store.fullName()).toBe('Ahmed');
    expect(store.hasValidSession()).toBe(true);
  });

  it('clears the session', () => {
    const store = TestBed.inject(UserStore);

    store.setSession(response());
    store.clear();

    expect(store.isLoggedIn()).toBe(false);
    expect(store.accessToken()).toBeNull();
  });

  it('restores the session after a refresh', async () => {
    const first = TestBed.inject(UserStore);

    first.setSession(response());
    await new Promise((resolve) => setTimeout(resolve, 50));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: TEST_ENVIRONMENT }],
    });

    const second = TestBed.inject(UserStore);

    await second.hydrate();

    expect(second.isLoggedIn()).toBe(true);
    expect(second.fullName()).toBe('Ahmed');
  });

  it('drops an expired saved session', async () => {
    const first = TestBed.inject(UserStore);

    first.setSession(response({ expiresAtUtc: new Date(Date.now() - 1000).toISOString() }));
    await new Promise((resolve) => setTimeout(resolve, 50));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: TEST_ENVIRONMENT }],
    });

    const second = TestBed.inject(UserStore);

    await second.hydrate();

    expect(second.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('test.session')).toBeNull();
  });
});
