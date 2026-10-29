import { AppEnvironment } from '../config/app-environment';

export const TEST_ENVIRONMENT: AppEnvironment = {
  production: false,
  appName: 'test',
  apiUrl: 'https://api.test/api',
  defaultLanguage: 'ar',
  storagePrefix: 'test',
  storageSecret: 'test-secret',
};
