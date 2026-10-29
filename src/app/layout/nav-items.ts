import { RoleName, RoleNames } from '@tamam/core';

export interface NavItem {
  label: string;
  path: string;
  roles: readonly RoleName[];
}

const merchantRoles = [RoleNames.Owner, RoleNames.Staff] as const;

/** The side menu. Each item is shown only to the roles listed in it. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'لوحة التحكم', path: '/dashboard', roles: merchantRoles },
  { label: 'الطلبات', path: '/orders', roles: merchantRoles },
  { label: 'العملاء', path: '/customers', roles: merchantRoles },
  { label: 'شركات الشحن', path: '/carriers', roles: merchantRoles },
  { label: 'المنتجات', path: '/products', roles: merchantRoles },
  { label: 'الإشعارات', path: '/notifications', roles: merchantRoles },
  { label: 'الاشتراك', path: '/billing', roles: [RoleNames.Owner] },
  { label: 'إعدادات المتجر', path: '/settings', roles: [RoleNames.Owner] },
  { label: 'لوحة المنصة', path: '/admin', roles: [RoleNames.PlatformAdmin] },
];
