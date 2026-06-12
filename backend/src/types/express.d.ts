declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth middleware after JWT verification. */
      userId?: string;
      /** Correlation ID set per request for logs + error responses. */
      requestId?: string;
    }
  }
}

export {};
