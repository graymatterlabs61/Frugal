/**
 * Typed error family. Anything not an ApiError is a 500 and goes to Sentry.
 * Response envelope is uniform: { error: { code, message, requestId } }
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required") {
    super(401, "unauthorized", message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, "forbidden", message);
  }
}

/** Foreign-owned resources also return 404 (never 403) to avoid IDOR existence leaks. */
export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404, "not_found", message);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Resource already exists") {
    super(409, "conflict", message);
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Invalid input") {
    super(422, "validation_error", message);
  }
}

export class RateLimitError extends ApiError {
  constructor(message = "Too many requests") {
    super(429, "rate_limited", message);
  }
}
