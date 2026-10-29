import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { AppEnvironment, APP_ENVIRONMENT } from '../config/app-environment';
import { UserStore } from '../auth/user.store';
import { authInterceptor } from '../http/auth.interceptor';
import { errorInterceptor } from '../http/error.interceptor';

/** Everything the core library needs. Call it once in `app.config.ts`. */
export function provideCore(environment: AppEnvironment): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: APP_ENVIRONMENT, useValue: environment },
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    provideAppInitializer(() => inject(UserStore).hydrate()),
  ]);
}
