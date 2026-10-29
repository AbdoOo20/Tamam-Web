import { TestBed } from '@angular/core/testing';

import { APP_ENVIRONMENT } from '../config/app-environment';
import { TEST_ENVIRONMENT } from '../testing/test-environment';
import { SecureStorage } from './secure-storage';

describe('SecureStorage', () => {
  let storage: SecureStorage;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: TEST_ENVIRONMENT }],
    });
    storage = TestBed.inject(SecureStorage);
  });

  it('returns what was stored', async () => {
    await storage.setItem('session', { token: 'abc', id: 7 });

    expect(await storage.getItem('session')).toEqual({ token: 'abc', id: 7 });
  });

  it('never writes the value in clear text', async () => {
    await storage.setItem('session', { token: 'super-secret-token' });

    const raw = localStorage.getItem('test.session') ?? '';

    expect(raw).not.toBe('');
    expect(raw).not.toContain('super-secret-token');
  });

  it('treats a tampered value as missing and removes it', async () => {
    await storage.setItem('session', { token: 'abc' });
    localStorage.setItem('test.session', 'AAAA' + (localStorage.getItem('test.session') ?? ''));

    expect(await storage.getItem('session')).toBeNull();
    expect(localStorage.getItem('test.session')).toBeNull();
  });

  it('returns null for a missing key', async () => {
    expect(await storage.getItem('missing')).toBeNull();
  });
});
