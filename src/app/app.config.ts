import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { provideCore } from '@tamam/core';

import { environment } from '../environments/environment';
import { AppTitleStrategy } from './app-title.strategy';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideCore(environment),
    { provide: TitleStrategy, useExisting: AppTitleStrategy },
  ],
};
