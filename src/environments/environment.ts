import { AppEnvironment } from '@tamam/core';

/** Production values. Replaced by `environment.development.ts` when running `ng serve`. */
export const environment: AppEnvironment = {
  production: true,
  appName: 'تمام',
  apiUrl: 'https://tamamapi.runasp.net/api',
  defaultLanguage: 'ar',
  storagePrefix: 'tamam',
  storageSecret: 'tm-22e2f0fef280cb1ab629fcd3a5b111ae7038ab9b69997da1956ef5412c4c4ec1',
};
