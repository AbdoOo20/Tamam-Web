import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/orders-page/orders-page').then((m) => m.OrdersPage),
  },
  {
    path: 'new',
    title: 'طلب جديد',
    loadComponent: () => import('./pages/order-form-page/order-form-page').then((m) => m.OrderFormPage),
  },
  {
    path: 'import',
    title: 'استيراد الطلبات',
    loadComponent: () => import('./pages/order-import-page/order-import-page').then((m) => m.OrderImportPage),
  },
  {
    path: ':id/edit',
    title: 'تعديل الطلب',
    loadComponent: () => import('./pages/order-form-page/order-form-page').then((m) => m.OrderFormPage),
  },
  {
    path: ':id',
    title: 'تفاصيل الطلب',
    loadComponent: () => import('./pages/order-detail-page/order-detail-page').then((m) => m.OrderDetailPage),
  },
];
