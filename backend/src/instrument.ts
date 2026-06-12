// Sentry must be the FIRST import of the process (see server.ts).
// Pre-load drizzle-orm to prevent Sentry's import-in-the-middle from breaking its named ESM exports
import "drizzle-orm";
import * as Sentry from "@sentry/node";
import { config } from "./config/unifiedConfig.js";

if (config.observability.sentryDsn) {
  Sentry.init({
    dsn: config.observability.sentryDsn,
    environment: config.env,
    tracesSampleRate: config.isProduction ? 0.2 : 1.0,
  });
}

export { Sentry };
