import { InjectionToken } from '@angular/core';

/** Project-wide settings. Values live in `src/environments/*`. */
export interface AppEnvironment {
  production: boolean;
  appName: string;
  /** Base URL of the backend API, without a trailing slash (e.g. https://localhost:7265/api). */
  apiUrl: string;
  defaultLanguage: 'ar' | 'en';
  /** Prefix for every key written to the browser storage. */
  storagePrefix: string;
  /** Secret used to derive the key that encrypts the browser storage. */
  storageSecret: string;
}

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT');
