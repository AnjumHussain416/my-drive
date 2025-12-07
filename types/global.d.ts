// Generic API success shape used in some endpoints (keeps compatibility).
interface ApiSuccessResponse<TData> {
  success: boolean;
  message?: string;
  data: TData;
  errors?: null | unknown;
  results?: TData;
}

// Generic API error shape
interface ApiErrorResponse {
  success: boolean;
  message?: string;
  data?: null;
  errors?: unknown[];
}

// Error container used with RTK Query custom base queries
interface RtkQueryError {
  status: number;
  data: ApiErrorResponse;
}

// Pagination metadata matching the API response you provided
interface PaginationMeta {
  current_page: number;
  from: number | null; // sometimes APIs return null when there are no items
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

// A paginated response wrapper for endpoints that return arrays with `meta`.
// Example shape:
// {
//   status: "success",
//   data: [ ... ],
//   meta: { current_page, from, last_page, per_page, to, total }
// }
type PaginatedResponse<T> = {
  status: "success" | string;
  data: T[];
  meta: PaginationMeta;
};

// Convenience alias for list responses
type ApiListResponse<T> = PaginatedResponse<T>;

// Example item (based on the objects in the `data` array you provided).
// Rename or duplicate this interface in domain-specific files when needed.
interface Dealer {
  id: number;
  name: string;
  isMaster: boolean;
}

// Deprecated/legacy pagination type kept for compatibility with older code.
// Prefer `PaginatedResponse<T>` for new code.
interface IPaginationData<TData> {
  total_items: number;
  total_pages: number;
  current_page: number;
  current_page_items: number;
  page_size: number;
  results: TData[];
  vultr_snapshots?: TData[];
}

export type FilterField =
  | "sort"
  | "make"
  | "model"
  | "maxYear"
  | "minYear"
  | "maxPrice"
  | "minPrice"
  | "mileage"
  | "transmission"
  | "body"
  | "color";

export interface FiltersConfig {
  show: FilterField[]; // which filters to render
}

export interface FilterValues {
  [key: string]: string | number | null;
}
