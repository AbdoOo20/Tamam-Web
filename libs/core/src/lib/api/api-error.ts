/** Error thrown by every API call that fails. */
export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly errors: readonly string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
