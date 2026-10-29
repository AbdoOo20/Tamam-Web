import { AppEnvironment } from '@tamam/core';

export const environment: AppEnvironment = {
  production: false,
  appName: 'تمام (تطوير)',
  apiUrl: 'https://localhost:7265/api',
  defaultLanguage: 'ar',
  storagePrefix: 'tamam-dev',
  storageSecret: 'dev-only-storage-secret',
};
