/** Numeric enums exactly as the backend sends them (`Tamam.Domain.Enums`). */

export const OrderStatus = {
  New: 1,
  AwaitingConfirmation: 2,
  Confirmed: 3,
  DepositRequested: 4,
  Shipped: 5,
  OutForDelivery: 6,
  Delivered: 7,
  Refused: 8,
  FailedDelivery: 9,
  Returned: 10,
  CancelledByMerchant: 11,
  CancelledByCustomer: 12,
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const RiskLevel = { Low: 1, Medium: 2, High: 3 } as const;
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const RecommendedAction = {
  None: 0,
  ConfirmOnly: 1,
  RequestDeposit: 2,
  ManualReview: 3,
} as const;
export type RecommendedAction = (typeof RecommendedAction)[keyof typeof RecommendedAction];

export const MerchantDecision = { FollowedRecommendation: 1, Ignored: 2, Reversed: 3 } as const;
export type MerchantDecision = (typeof MerchantDecision)[keyof typeof MerchantDecision];

export const PaymentMethod = { Cod: 1, Prepaid: 2, CodWithDeposit: 3 } as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const RejectionAttribution = { Customer: 1, Merchant: 2, Carrier: 3, Neutral: 4 } as const;
export type RejectionAttribution = (typeof RejectionAttribution)[keyof typeof RejectionAttribution];

export const ConfirmationStatus = {
  Created: 1,
  Sent: 2,
  Delivered: 3,
  Opened: 4,
  Confirmed: 5,
  Cancelled: 6,
  Rescheduled: 7,
  NoResponse: 8,
  Failed: 9,
} as const;
export type ConfirmationStatus = (typeof ConfirmationStatus)[keyof typeof ConfirmationStatus];

export const MessageChannel = { WaMeLink: 1, WhatsAppCloudApi: 2, Sms: 3 } as const;
export type MessageChannel = (typeof MessageChannel)[keyof typeof MessageChannel];

export const MessageDeliveryStatus = { Queued: 1, Sent: 2, Delivered: 3, Read: 4, Failed: 5 } as const;
export type MessageDeliveryStatus =
  (typeof MessageDeliveryStatus)[keyof typeof MessageDeliveryStatus];

export const DeliveryAttemptResult = {
  Delivered: 1,
  Refused: 2,
  NoAnswer: 3,
  AddressNotFound: 4,
  Postponed: 5,
  Other: 6,
} as const;
export type DeliveryAttemptResult =
  (typeof DeliveryAttemptResult)[keyof typeof DeliveryAttemptResult];

export const OrderFinalResult = { Delivered: 1, Refused: 2, Cancelled: 3, Failed: 4 } as const;
export type OrderFinalResult = (typeof OrderFinalResult)[keyof typeof OrderFinalResult];

export const SubscriptionStatus = { Trial: 1, Active: 2, Cancelled: 3 } as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const MerchantStatus = { Trial: 1, Active: 2, Suspended: 3, Closed: 4 } as const;
export type MerchantStatus = (typeof MerchantStatus)[keyof typeof MerchantStatus];

export const DataRequestType = { OptOut: 1, Delete: 2, Access: 3 } as const;
export type DataRequestType = (typeof DataRequestType)[keyof typeof DataRequestType];

export const DataRequestStatus = { Open: 1, Done: 2, Rejected: 3 } as const;
export type DataRequestStatus = (typeof DataRequestStatus)[keyof typeof DataRequestStatus];

export const PublicLinkPurpose = { OrderConfirmation: 1, RejectionSurvey: 2 } as const;
export type PublicLinkPurpose = (typeof PublicLinkPurpose)[keyof typeof PublicLinkPurpose];

export const ImportKind = { Historical: 1, Regular: 2 } as const;
export type ImportKind = (typeof ImportKind)[keyof typeof ImportKind];

export const UsageType = { OrderCheck: 1, WhatsAppMessage: 2, Sms: 3 } as const;
export type UsageType = (typeof UsageType)[keyof typeof UsageType];
