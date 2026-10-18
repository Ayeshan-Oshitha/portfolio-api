export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ApiPaginatedResponse<T> = ApiSuccessResponse<T[]> & {
  meta: PaginationMeta;
};

export type ApiValidationDetail = {
  field: string;
  messages: string[];
};
export type ApiErrorResponse = {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details: ApiValidationDetail[] | null;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'SERVICE_UNAVAILABLE'
  | 'HTTP_ERROR'
  | 'INTERNAL_SERVER_ERROR';
