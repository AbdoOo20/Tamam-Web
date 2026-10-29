import { RoleName, RoleNames } from '@tamam/core';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: readonly RoleName[];
}

export interface NavGroup {
  title: string | null;
  items: readonly NavItem[];
}

const merchantRoles = [RoleNames.Owner, RoleNames.Staff] as const;

/** The side menu. Each item is shown only to the roles listed in it. */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    title: null,
    items: [
      { label: 'لوحة التحكم', path: '/dashboard', icon: 'bi-speedometer2', roles: merchantRoles },
      { label: 'الطلبات', path: '/orders', icon: 'bi-bag-check', roles: merchantRoles },
      { label: 'العملاء', path: '/customers', icon: 'bi-people', roles: merchantRoles },
      { label: 'شركات الشحن', path: '/carriers', icon: 'bi-truck', roles: merchantRoles },
      { label: 'المنتجات', path: '/products', icon: 'bi-box-seam', roles: merchantRoles },
    ],
  },
  {
    title: 'الحساب',
    items: [
      { label: 'الإشعارات', path: '/notifications', icon: 'bi-bell', roles: merchantRoles },
      { label: 'الاشتراك والفواتير', path: '/billing', icon: 'bi-credit-card-2-front', roles: [RoleNames.Owner] },
      { label: 'إعدادات المتجر', path: '/settings', icon: 'bi-gear', roles: [RoleNames.Owner] },
    ],
  },
  {
    title: 'المنصة',
    items: [{ label: 'لوحة المنصة', path: '/admin', icon: 'bi-shield-lock', roles: [RoleNames.PlatformAdmin] }],
  },
];
