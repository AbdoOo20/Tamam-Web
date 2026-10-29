import { SubscriptionStatus, UsageType } from '@tamam/shared';

export interface Plan {
  id: number;
  code: string;
  nameAr: string;
  monthlyFee: number;
  pricePerCheckedOrder: number;
  includedOrders: number;
  currencyCode: string;
}

export interface Subscription {
  id: number;
  plan: Plan;
  status: SubscriptionStatus;
  startedAt: string;
  trialEndsAt: string | null;
  endsAt: string | null;
  usedOrders: number;
  remainingIncludedOrders: number;
}

export interface UsageLine {
  type: UsageType;
  quantity: number;
  totalCost: number;
}

export interface UsageSummary {
  from: string;
  to: string;
  lines: UsageLine[];
  totalCost: number;
}
