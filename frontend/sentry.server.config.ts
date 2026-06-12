import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",

  // Capture 100% of traces in dev, 20% in prod
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Attach stack traces to captured messages
  attachStacktrace: true,

  // Don't print debug info in production
  debug: false,
});
