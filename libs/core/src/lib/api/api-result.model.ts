/** The envelope every backend response is wrapped in. */
export interface ApiResult<T> {
  succeeded: boolean;
  statusCode: number;
  message: string | null;
  errors: string[];
  data: T | null;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PagedQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export type QueryParams = Record<string, string | number | boolean | Date | null | undefined>;
