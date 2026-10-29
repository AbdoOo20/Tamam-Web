import { Routes } from '@angular/router';

export const LANDING_ROUTES: Routes = [
  {
    path: '',
    title: 'تمام | درع الدفع عند الاستلام',
    loadComponent: () => import('./pages/landing-page/landing-page').then((m) => m.LandingPage),
  },
];
