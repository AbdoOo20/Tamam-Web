export interface CountByKey {
  key: string;
  count: number;
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface Dashboard {
  from: string;
  to: string;
  currencyCode: string;
  totalOrders: number;
  deliveredOrders: number;
  refusedOrders: number;
  cancelledOrders: number;
  inProgressOrders: number;
  deliveryRatePercent: number;
  deliveredRevenue: number;
  totalLoss: number;
  byStatus: CountByKey[];
  riskDistribution: CountByKey[];
  refusalsByAttribution: CountByKey[];
  ordersPerDay: DailyCount[];
}

export interface QualityMonth {
  year: number;
  month: number;
  finalizedOrders: number;
  delivered: number;
  refused: number;
  refusedCustomerFault: number;
  refusedMerchantFault: number;
  refusedCarrierFault: number;
  refusedNeutral: number;
  disputed: number;
  totalLoss: number;
  merchantFaultRatePercent: number;
  networkMerchantFaultRatePercent: number;
}
