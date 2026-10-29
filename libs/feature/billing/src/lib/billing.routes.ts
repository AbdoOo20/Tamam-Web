import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/billing-page/billing-page').then((m) => m.BillingPage),
  },
];
