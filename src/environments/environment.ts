import { AppEnvironment } from '@tamam/core';

/** Production values. Replaced by `environment.development.ts` when running `ng serve`. */
export const environment: AppEnvironment = {
  production: true,
  appName: 'تمام',
  apiUrl: 'https://api.your-domain.com/api',
  defaultLanguage: 'ar',
  storagePrefix: 'tamam',
  storageSecret: 'CHANGE-ME-production-storage-secret',
};
