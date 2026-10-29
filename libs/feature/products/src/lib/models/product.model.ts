export interface Product {
  id: number;
  sku: string | null;
  name: string;
  defaultPrice: number | null;
  adUrl: string | null;
  isActive: boolean;
}

export interface ProductRequest {
  sku: string | null;
  name: string;
  defaultPrice: number | null;
  adUrl: string | null;
  isActive: boolean;
}

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}
