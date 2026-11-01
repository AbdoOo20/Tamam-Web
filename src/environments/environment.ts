import { AppEnvironment } from '@tamam/core';

/** Production values. Replaced by `environment.development.ts` when running `ng serve`. */
export const environment: AppEnvironment = {
  production: true,
  appName: 'تمام',
  apiUrl: 'https://tamamapi.runasp.net/api',
  defaultLanguage: 'ar',
  storagePrefix: 'tamam',
  storageSecret: 'CHANGE-ME-production-storage-secret',
};
