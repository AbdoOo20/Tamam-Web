export interface Customer {
  id: number;
  fullName: string;
  phoneE164: string;
  altPhoneE164: string | null;
  hasWhatsApp: boolean | null;
  notes: string | null;
  totalOrders: number;
  deliveredOrders: number;
  refusedOrders: number;
  lastOrderAt: string | null;
  /** 0-100 score built from the shared network history; null when there is no history yet. */
  networkReliabilityScore: number | null;
}

export interface UpdateCustomerRequest {
  fullName: string;
  altPhone: string | null;
  hasWhatsApp: boolean | null;
  notes: string | null;
}
