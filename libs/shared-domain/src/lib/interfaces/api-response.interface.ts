export interface ApiPaginationMeta {
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  meta?: ApiPaginationMeta;
  statusCode?: number;
}
