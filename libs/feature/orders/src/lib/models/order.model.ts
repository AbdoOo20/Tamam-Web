import {
  ConfirmationStatus,
  DeliveryAttemptResult,
  ImportKind,
  MerchantDecision,
  OrderFinalResult,
  OrderStatus,
  PaymentMethod,
  RecommendedAction,
  RejectionAttribution,
  RiskLevel,
} from '@tamam/shared';

/** Mirrors `OrderListItemDto`. */
export interface OrderListItem {
  id: number;
  orderNo: string;
  recipientName: string;
  recipientPhoneE164: string;
  city: string | null;
  currencyCode: string;
  totalAmount: number;
  amountToCollect: number;
  statusId: OrderStatus;
  statusName: string;
  latestRiskScore: number | null;
  latestRiskLevel: RiskLevel | null;
  expectedDeliveryDate: string | null;
  placedAt: string;
}

export interface OrderQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  statusId?: number;
  riskLevel?: number;
  carrierId?: number;
  from?: string;
  to?: string;
}

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  variant: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderStatusHistory {
  id: number;
  fromStatusId: OrderStatus | null;
  toStatusId: OrderStatus;
  changedByType: number;
  changedByUserId: number | null;
  note: string | null;
  changedAt: string;
}

export interface DeliveryAttempt {
  id: number;
  attemptNo: number;
  attemptedAt: string;
  result: DeliveryAttemptResult;
  carrierNote: string | null;
  proofImageUrl: string | null;
}

export interface RiskSignal {
  ruleId: number;
  points: number;
  explanationAr: string;
}

export interface RiskAssessment {
  id: number;
  score: number;
  level: RiskLevel;
  recommendedAction: RecommendedAction;
  isShadow: boolean;
  merchantDecision: MerchantDecision | null;
  decidedAt: string | null;
  createdAt: string;
  signals: RiskSignal[];
}

export interface Confirmation {
  orderId: number;
  attemptNo: number;
  status: ConfirmationStatus;
  link: string;
  expiresAt: string;
  messageBody: string;
  whatsAppUrl: string | null;
  sentAt: string | null;
  respondedAt: string | null;
  proposedDeliveryDate: string | null;
  responseNote: string | null;
}

export interface OrderOutcome {
  finalResult: OrderFinalResult;
  finalReasonId: number | null;
  attribution: RejectionAttribution | null;
  isDisputed: boolean;
  resolutionMethod: number | null;
  customerFaultWeight: number;
  outboundShippingCost: number;
  returnShippingCost: number;
  otherLoss: number;
  lossAmount: number;
  resolvedAt: string | null;
}

export interface OrderDetail {
  id: number;
  orderNo: string;
  statusId: OrderStatus;
  statusName: string;
  source: number;
  isHistorical: boolean;
  recipientName: string;
  recipientPhoneE164: string;
  altPhoneE164: string | null;
  countryCode: string;
  regionId: number | null;
  city: string | null;
  addressLine: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  currencyCode: string;
  itemsTotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  depositAmount: number;
  amountToCollect: number;
  expectedDeliveryDate: string | null;
  carrierId: number | null;
  carrierName: string | null;
  trackingNo: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  notes: string | null;
  placedAt: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  deliveryAttempts: DeliveryAttempt[];
  risk: RiskAssessment | null;
  confirmation: Confirmation | null;
  rejectionSurveyLink: string | null;
  outcome: OrderOutcome | null;
}

export interface OrderItemRequest {
  productId: number | null;
  productName: string;
  variant: string | null;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  orderNo: string | null;
  recipientName: string;
  recipientPhone: string;
  altPhone: string | null;
  regionId: number | null;
  city: string | null;
  addressLine: string;
  landmark: string | null;
  latitude?: number | null;
  longitude?: number | null;
  shippingFee: number;
  discountAmount: number;
  paymentMethod: PaymentMethod;
  depositAmount: number;
  expectedDeliveryDate: string | null;
  carrierId: number | null;
  notes: string | null;
  items: OrderItemRequest[];
  /** Only for bulk import of past orders. */
  placedAt?: string | null;
  historicalStatus?: OrderStatus | null;
}

export type UpdateOrderRequest = Omit<
  CreateOrderRequest,
  'orderNo' | 'recipientPhone' | 'items' | 'placedAt' | 'historicalStatus'
> & { trackingNo: string | null };

export interface ChangeOrderStatusRequest {
  statusId: OrderStatus;
  note: string | null;
}

export interface AddDeliveryAttemptRequest {
  result: DeliveryAttemptResult;
  carrierNote: string | null;
  proofImageUrl: string | null;
}

export interface MessageLog {
  id: number;
  direction: number;
  channel: number;
  toPhoneE164: string | null;
  body: string | null;
  deliveryStatus: number;
  createdAt: string;
}

export interface RejectionReport {
  id: number;
  orderId: number;
  reporterType: number;
  reasonId: number;
  reasonName: string;
  attribution: RejectionAttribution;
  details: string | null;
  evidenceUrl: string | null;
  createdAt: string;
}

export interface ReportRejectionRequest {
  orderId: number;
  reasonId: number;
  details: string | null;
  evidenceUrl: string | null;
}

export interface UpdateLossRequest {
  outboundShippingCost: number;
  returnShippingCost: number;
  otherLoss: number;
}

export interface OrderImportRequest {
  fileName: string;
  kind: ImportKind;
  orders: CreateOrderRequest[];
}

export interface OrderImportResult {
  importId: number;
  status: number;
  rowsTotal: number;
  rowsImported: number;
  rowsFailed: number;
  errors: string[];
}
