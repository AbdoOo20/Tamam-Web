import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    title: 'تسجيل الدخول',
    loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    title: 'إنشاء حساب',
    loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage),
  },
];
