export interface CarrierOption {
  id: number;
  name: string;
  isActive: boolean;
}

export interface ProductOption {
  id: number;
  name: string;
  defaultPrice: number | null;
  isActive: boolean;
}

export interface Region {
  id: number;
  countryCode: string;
  parentRegionId: number | null;
  nameAr: string;
  nameEn: string | null;
}

export interface MerchantInfo {
  countryCode: string;
  currencyCode: string;
}
