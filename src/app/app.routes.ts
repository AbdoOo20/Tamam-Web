import { Routes } from '@angular/router';
import { authGuard, guestGuard, homeGuard, roleGuard, RoleNames } from '@tamam/core';

import { MainLayout } from './layout/main-layout/main-layout';

/**
 * Every feature is a library loaded lazily through its public API (`@tamam/<feature>`).
 * Guards live here, so a feature never decides who can reach it.
 */
export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('@tamam/auth').then((m) => m.AUTH_ROUTES),
  },
  {
    // Public pages the customer opens from our links: /c/:token and /s/:token
    path: '',
    loadChildren: () => import('@tamam/public-links').then((m) => m.PUBLIC_LINKS_ROUTES),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', canActivate: [homeGuard], children: [] },
      {
        path: 'dashboard',
        title: 'لوحة التحكم',
        canActivate: [roleGuard(RoleNames.Owner, RoleNames.Staff)],
        loadChildren: () => import('@tamam/dashboard').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'orders',
        title: 'الطلبات',
        canActivate: [roleGuard(RoleNames.Owner, RoleNames.Staff)],
        loadChildren: () => import('@tamam/orders').then((m) => m.ORDERS_ROUTES),
      },
      {
        path: 'customers',
        title: 'العملاء',
        canActivate: [roleGuard(RoleNames.Owner, RoleNames.Staff)],
        loadChildren: () => import('@tamam/customers').then((m) => m.CUSTOMERS_ROUTES),
      },
      {
        path: 'carriers',
        title: 'شركات الشحن',
        canActivate: [roleGuard(RoleNames.Owner, RoleNames.Staff)],
        loadChildren: () => import('@tamam/carriers').then((m) => m.CARRIERS_ROUTES),
      },
      {
        path: 'products',
        title: 'المنتجات',
        canActivate: [roleGuard(RoleNames.Owner, RoleNames.Staff)],
        loadChildren: () => import('@tamam/products').then((m) => m.PRODUCTS_ROUTES),
      },
      {
        path: 'notifications',
        title: 'الإشعارات',
        canActivate: [roleGuard(RoleNames.Owner, RoleNames.Staff)],
        loadChildren: () => import('@tamam/notifications').then((m) => m.NOTIFICATIONS_ROUTES),
      },
      {
        path: 'billing',
        title: 'الاشتراك',
        canActivate: [roleGuard(RoleNames.Owner)],
        loadChildren: () => import('@tamam/billing').then((m) => m.BILLING_ROUTES),
      },
      {
        path: 'settings',
        title: 'إعدادات المتجر',
        canActivate: [roleGuard(RoleNames.Owner)],
        loadChildren: () => import('@tamam/merchant').then((m) => m.MERCHANT_ROUTES),
      },
      {
        path: 'admin',
        title: 'لوحة المنصة',
        canActivate: [roleGuard(RoleNames.PlatformAdmin)],
        loadChildren: () => import('@tamam/admin').then((m) => m.ADMIN_ROUTES),
      },
    ],
  },
  {
    path: '**',
    title: 'الصفحة غير موجودة',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
