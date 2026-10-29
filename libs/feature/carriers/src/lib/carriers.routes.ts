import { Routes } from '@angular/router';

export const CARRIERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/carriers-page/carriers-page').then((m) => m.CarriersPage),
  },
];
