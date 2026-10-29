import { Routes } from '@angular/router';

/** Pages opened by the customer from the links we send (no sign-in needed). */
export const PUBLIC_LINKS_ROUTES: Routes = [
  {
    path: 'c/:token',
    loadComponent: () =>
      import('./pages/confirmation-page/confirmation-page').then((m) => m.ConfirmationPage),
  },
  {
    path: 's/:token',
    loadComponent: () => import('./pages/survey-page/survey-page').then((m) => m.SurveyPage),
  },
];
