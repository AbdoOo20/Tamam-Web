import { Routes } from '@angular/router';

export const MERCHANT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/merchant-page/merchant-page').then((m) => m.MerchantPage),
  },
];
