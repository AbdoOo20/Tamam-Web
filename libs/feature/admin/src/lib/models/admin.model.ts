import { DataRequestStatus, DataRequestType, MerchantStatus, SubscriptionStatus } from '@tamam/shared';

export interface AdminOverview {
  merchants: number;
  activeMerchants: number;
  trialMerchants: number;
  suspendedMerchants: number;
  totalOrders: number;
  ordersLast30Days: number;
  deliveredLast30Days: number;
  refusedLast30Days: number;
  refusalRateLast30DaysPercent: number;
  openDataRequests: number;
}

export interface AdminMerchantListItem {
  id: number;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string | null;
  countryCode: string;
  status: MerchantStatus;
  shadowMode: boolean;
  ordersCount: number;
  createdAt: string;
}

export interface AdminMerchantDetail {
  id: number;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string | null;
  countryCode: string;
  currencyCode: string;
  storeUrl: string | null;
  status: MerchantStatus;
  shadowMode: boolean;
  hasApiKey: boolean;
  planCode: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  usersCount: number;
  ordersCount: number;
  ordersLast30Days: number;
  refusedLast30Days: number;
  createdAt: string;
}

export interface AdminPlan {
  id: number;
  code: string;
  nameAr: string;
  monthlyFee: number;
  pricePerCheckedOrder: number;
  includedOrders: number;
  currencyCode: string;
  isActive: boolean;
}

export type AdminPlanRequest = Omit<AdminPlan, 'id'>;

export interface AdminRiskRule {
  id: number;
  code: string;
  nameAr: string;
  explanationTemplateAr: string;
  points: number;
  scope: string;
  parametersJson: string | null;
  isActive: boolean;
  version: number;
}

export interface UpdateRiskRuleRequest {
  nameAr: string;
  explanationTemplateAr: string;
  points: number;
  isActive: boolean;
}

export interface DataRequest {
  id: number;
  customerId: number | null;
  type: DataRequestType;
  status: DataRequestStatus;
  requestedAt: string;
  processedAt: string | null;
  processedByUserId: number | null;
}

export interface CustomerDataExport {
  customerId: number;
  firstSeenAt: string;
  isOptedOut: boolean;
  orders: {
    merchantName: string;
    orderNo: string;
    placedAt: string;
    recipientName: string;
    addressLine: string;
    currencyCode: string;
    totalAmount: number;
    status: string;
  }[];
}

export interface AdminAuditLog {
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
