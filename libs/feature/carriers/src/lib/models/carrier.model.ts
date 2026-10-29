export interface Carrier {
  id: number;
  name: string;
  phone: string | null;
  trackingUrlTemplate: string | null;
  isActive: boolean;
  /** A carrier shared by the platform; it cannot be edited by a merchant. */
  isGlobal: boolean;
}

export interface CarrierRequest {
  name: string;
  phone: string | null;
  trackingUrlTemplate: string | null;
  isActive: boolean;
}
