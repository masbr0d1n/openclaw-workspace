/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiError {
  status: boolean;
  statusCode: number;
  error: string;
  message: string;
}

/**
 * Pagination Types
 */
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
}
