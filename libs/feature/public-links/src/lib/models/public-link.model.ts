import { OrderStatus, PublicLinkPurpose } from '@tamam/shared';

export interface PublicOrderItem {
  name: string;
  variant: string | null;
  quantity: number;
  unitPrice: number;
}

export interface PublicOrder {
  purpose: PublicLinkPurpose;
  storeName: string;
  recipientName: string;
  currencyCode: string;
  totalAmount: number;
  amountToCollect: number;
  city: string | null;
  addressLine: string;
  expectedDeliveryDate: string | null;
  status: OrderStatus;
  canRespond: boolean;
  expiresAt: string;
  items: PublicOrderItem[];
}

export interface PublicRejectionReason {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  attribution: string;
  sortOrder: number;
}
