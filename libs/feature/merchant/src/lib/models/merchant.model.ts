export interface MerchantProfile {
  id: number;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string | null;
  countryCode: string;
  currencyCode: string;
  defaultLanguage: string;
  storeUrl: string | null;
  instagramHandle: string | null;
  status: string;
  shadowMode: boolean;
  createdAt: string;
}

export interface UpdateMerchantProfileRequest {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string | null;
  defaultLanguage: string;
  storeUrl: string | null;
  instagramHandle: string | null;
  shadowMode: boolean;
}

export interface Consent {
  id: number;
  termsVersion: string;
  shareOutcomesToNetwork: boolean;
  acceptedAt: string;
}

export interface Staff {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface CreateStaffRequest {
  fullName: string;
  email: string;
  phoneNumber: string | null;
  password: string;
}

export interface AuditLog {
  id: number;
  merchantId: number | null;
  userId: number | null;
  userName: string | null;
  action: string;
  entityName: string;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditQuery {
  page?: number;
  pageSize?: number;
  entityName?: string;
  action?: string;
  from?: string;
  to?: string;
}

export interface MessageTemplate {
  id: number;
  code: string;
  language: string;
  channel: number;
  category: number;
  body: string;
}
