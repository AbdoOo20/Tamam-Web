import {
  ConfirmationStatus,
  DataRequestStatus,
  DataRequestType,
  DeliveryAttemptResult,
  MerchantDecision,
  MerchantStatus,
  MessageDeliveryStatus,
  OrderFinalResult,
  OrderStatus,
  PaymentMethod,
  RecommendedAction,
  RejectionAttribution,
  RiskLevel,
  SubscriptionStatus,
  UsageType,
} from './enums';

/** Visual tone of a badge. Maps to Bootstrap's contextual colors. */
export type Tone = 'success' | 'danger' | 'warning' | 'info' | 'secondary' | 'primary' | 'dark';

export interface Meta {
  label: string;
  tone: Tone;
  icon: string;
}

/** Looks a value up in a meta table and never throws on an unknown value. */
export function metaOf(table: Record<number, Meta>, value: number | null | undefined): Meta {
  return (value !== null && value !== undefined ? table[value] : undefined) ?? UNKNOWN_META;
}

export const UNKNOWN_META: Meta = { label: 'غير معروف', tone: 'secondary', icon: 'bi-question-circle' };

export const ORDER_STATUS_META: Record<number, Meta> = {
  [OrderStatus.New]: { label: 'جديد', tone: 'info', icon: 'bi-stars' },
  [OrderStatus.AwaitingConfirmation]: { label: 'بانتظار التأكيد', tone: 'warning', icon: 'bi-hourglass-split' },
  [OrderStatus.Confirmed]: { label: 'مؤكد', tone: 'primary', icon: 'bi-check2-circle' },
  [OrderStatus.DepositRequested]: { label: 'مطلوب عربون', tone: 'warning', icon: 'bi-cash-coin' },
  [OrderStatus.Shipped]: { label: 'تم الشحن', tone: 'info', icon: 'bi-box-seam' },
  [OrderStatus.OutForDelivery]: { label: 'خرج للتسليم', tone: 'info', icon: 'bi-truck' },
  [OrderStatus.Delivered]: { label: 'تم التسليم', tone: 'success', icon: 'bi-bag-check' },
  [OrderStatus.Refused]: { label: 'مرفوض', tone: 'danger', icon: 'bi-x-octagon' },
  [OrderStatus.FailedDelivery]: { label: 'فشل التسليم', tone: 'danger', icon: 'bi-exclamation-triangle' },
  [OrderStatus.Returned]: { label: 'مرتجع', tone: 'dark', icon: 'bi-arrow-return-left' },
  [OrderStatus.CancelledByMerchant]: { label: 'ملغي من التاجر', tone: 'secondary', icon: 'bi-slash-circle' },
  [OrderStatus.CancelledByCustomer]: { label: 'ملغي من العميل', tone: 'secondary', icon: 'bi-person-x' },
};

/** The statuses the backend allows to move to, mirroring `OrderService.Transitions`. */
export const ORDER_TRANSITIONS: Record<number, readonly OrderStatus[]> = {
  [OrderStatus.New]: [OrderStatus.AwaitingConfirmation, OrderStatus.Confirmed, OrderStatus.CancelledByMerchant],
  [OrderStatus.AwaitingConfirmation]: [OrderStatus.Confirmed, OrderStatus.CancelledByMerchant, OrderStatus.CancelledByCustomer],
  [OrderStatus.Confirmed]: [OrderStatus.DepositRequested, OrderStatus.Shipped, OrderStatus.CancelledByMerchant, OrderStatus.CancelledByCustomer],
  [OrderStatus.DepositRequested]: [OrderStatus.Confirmed, OrderStatus.Shipped, OrderStatus.CancelledByMerchant, OrderStatus.CancelledByCustomer],
  [OrderStatus.Shipped]: [OrderStatus.OutForDelivery, OrderStatus.Delivered, OrderStatus.Refused, OrderStatus.FailedDelivery, OrderStatus.Returned],
  [OrderStatus.OutForDelivery]: [OrderStatus.Delivered, OrderStatus.Refused, OrderStatus.FailedDelivery],
  [OrderStatus.FailedDelivery]: [OrderStatus.OutForDelivery, OrderStatus.Shipped, OrderStatus.Delivered, OrderStatus.Refused, OrderStatus.Returned],
  [OrderStatus.Refused]: [OrderStatus.Returned],
};

/** Statuses in which the backend still accepts item changes. */
export const EDITABLE_ORDER_STATUSES: readonly OrderStatus[] = [
  OrderStatus.New,
  OrderStatus.AwaitingConfirmation,
  OrderStatus.Confirmed,
  OrderStatus.DepositRequested,
];

export const RISK_LEVEL_META: Record<number, Meta> = {
  [RiskLevel.Low]: { label: 'مخاطرة منخفضة', tone: 'success', icon: 'bi-shield-check' },
  [RiskLevel.Medium]: { label: 'مخاطرة متوسطة', tone: 'warning', icon: 'bi-shield-exclamation' },
  [RiskLevel.High]: { label: 'مخاطرة عالية', tone: 'danger', icon: 'bi-shield-x' },
};

export const RECOMMENDED_ACTION_LABEL: Record<number, string> = {
  [RecommendedAction.None]: 'لا يوجد إجراء مقترح',
  [RecommendedAction.ConfirmOnly]: 'يكفي تأكيد الطلب مع العميل',
  [RecommendedAction.RequestDeposit]: 'اطلب عربونًا قبل الشحن',
  [RecommendedAction.ManualReview]: 'راجع الطلب يدويًا قبل الشحن',
};

export const MERCHANT_DECISION_LABEL: Record<number, string> = {
  [MerchantDecision.FollowedRecommendation]: 'اتبعت التوصية',
  [MerchantDecision.Ignored]: 'تجاهلت التوصية',
  [MerchantDecision.Reversed]: 'عكست التوصية',
};

export const PAYMENT_METHOD_LABEL: Record<number, string> = {
  [PaymentMethod.Cod]: 'الدفع عند الاستلام',
  [PaymentMethod.Prepaid]: 'مدفوع مسبقًا',
  [PaymentMethod.CodWithDeposit]: 'دفع عند الاستلام مع عربون',
};

export const ATTRIBUTION_META: Record<number, Meta> = {
  [RejectionAttribution.Customer]: { label: 'العميل', tone: 'danger', icon: 'bi-person' },
  [RejectionAttribution.Merchant]: { label: 'التاجر', tone: 'warning', icon: 'bi-shop' },
  [RejectionAttribution.Carrier]: { label: 'شركة الشحن', tone: 'info', icon: 'bi-truck' },
  [RejectionAttribution.Neutral]: { label: 'محايد', tone: 'secondary', icon: 'bi-dash-circle' },
};

export const CONFIRMATION_STATUS_META: Record<number, Meta> = {
  [ConfirmationStatus.Created]: { label: 'لم يُرسل بعد', tone: 'secondary', icon: 'bi-clock' },
  [ConfirmationStatus.Sent]: { label: 'تم الإرسال', tone: 'info', icon: 'bi-send' },
  [ConfirmationStatus.Delivered]: { label: 'وصلت الرسالة', tone: 'info', icon: 'bi-envelope-check' },
  [ConfirmationStatus.Opened]: { label: 'فتح العميل الرابط', tone: 'info', icon: 'bi-eye' },
  [ConfirmationStatus.Confirmed]: { label: 'أكّد العميل', tone: 'success', icon: 'bi-check-circle' },
  [ConfirmationStatus.Cancelled]: { label: 'ألغى العميل', tone: 'danger', icon: 'bi-x-circle' },
  [ConfirmationStatus.Rescheduled]: { label: 'طلب تأجيل', tone: 'warning', icon: 'bi-calendar-event' },
  [ConfirmationStatus.NoResponse]: { label: 'لم يرد', tone: 'secondary', icon: 'bi-hourglass-bottom' },
  [ConfirmationStatus.Failed]: { label: 'فشل الإرسال', tone: 'danger', icon: 'bi-exclamation-octagon' },
};

export const DELIVERY_ATTEMPT_LABEL: Record<number, string> = {
  [DeliveryAttemptResult.Delivered]: 'تم التسليم',
  [DeliveryAttemptResult.Refused]: 'رفض العميل',
  [DeliveryAttemptResult.NoAnswer]: 'لا يرد',
  [DeliveryAttemptResult.AddressNotFound]: 'العنوان غير موجود',
  [DeliveryAttemptResult.Postponed]: 'تم التأجيل',
  [DeliveryAttemptResult.Other]: 'سبب آخر',
};

export const FINAL_RESULT_LABEL: Record<number, string> = {
  [OrderFinalResult.Delivered]: 'تم التسليم',
  [OrderFinalResult.Refused]: 'مرفوض',
  [OrderFinalResult.Cancelled]: 'ملغي',
  [OrderFinalResult.Failed]: 'فشل',
};

export const MESSAGE_DELIVERY_LABEL: Record<number, string> = {
  [MessageDeliveryStatus.Queued]: 'في الانتظار',
  [MessageDeliveryStatus.Sent]: 'أُرسلت',
  [MessageDeliveryStatus.Delivered]: 'وصلت',
  [MessageDeliveryStatus.Read]: 'قُرئت',
  [MessageDeliveryStatus.Failed]: 'فشلت',
};

export const SUBSCRIPTION_STATUS_META: Record<number, Meta> = {
  [SubscriptionStatus.Trial]: { label: 'فترة تجريبية', tone: 'info', icon: 'bi-gift' },
  [SubscriptionStatus.Active]: { label: 'نشط', tone: 'success', icon: 'bi-patch-check' },
  [SubscriptionStatus.Cancelled]: { label: 'ملغي', tone: 'secondary', icon: 'bi-slash-circle' },
};

export const MERCHANT_STATUS_META: Record<number, Meta> = {
  [MerchantStatus.Trial]: { label: 'تجريبي', tone: 'info', icon: 'bi-gift' },
  [MerchantStatus.Active]: { label: 'نشط', tone: 'success', icon: 'bi-patch-check' },
  [MerchantStatus.Suspended]: { label: 'موقوف', tone: 'warning', icon: 'bi-pause-circle' },
  [MerchantStatus.Closed]: { label: 'مغلق', tone: 'secondary', icon: 'bi-lock' },
};

export const DATA_REQUEST_TYPE_LABEL: Record<number, string> = {
  [DataRequestType.OptOut]: 'إيقاف الرسائل',
  [DataRequestType.Delete]: 'حذف البيانات',
  [DataRequestType.Access]: 'طلب نسخة من البيانات',
};

export const DATA_REQUEST_STATUS_META: Record<number, Meta> = {
  [DataRequestStatus.Open]: { label: 'مفتوح', tone: 'warning', icon: 'bi-inbox' },
  [DataRequestStatus.Done]: { label: 'تم التنفيذ', tone: 'success', icon: 'bi-check2-all' },
  [DataRequestStatus.Rejected]: { label: 'مرفوض', tone: 'secondary', icon: 'bi-x-lg' },
};

export const USAGE_TYPE_LABEL: Record<number, string> = {
  [UsageType.OrderCheck]: 'فحص طلبات',
  [UsageType.WhatsAppMessage]: 'رسائل واتساب',
  [UsageType.Sms]: 'رسائل SMS',
};

/** Rejection reasons shown to the merchant; the ids match `RejectionReasonType`. */
export const REJECTION_REASON_LABEL: Record<number, string> = {
  1: 'غيّر رأيه',
  2: 'لا يملك المال',
  3: 'لا يرد على الهاتف',
  4: 'طلب مكرر',
  5: 'وجد سعرًا أرخص',
  6: 'المنتج غير مطابق للإعلان',
  7: 'منتج تالف أو معيب',
  8: 'منتج خاطئ',
  9: 'السعر مختلف عن المتفق عليه',
  10: 'تأخر التوصيل',
  11: 'سلوك المندوب',
  12: 'العنوان غير موجود',
  13: 'لم يطلب هذا الطلب',
  14: 'سبب آخر',
};
