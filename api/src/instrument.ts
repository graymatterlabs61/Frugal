import * as Sentry from '@sentry/node';
import { config } from '@/config/unifiedConfig';

Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.env,
  tracesSampleRate: config.isProduction ? 0.1 : 1.0,
  beforeSend(event) {
    // Scrub sensitive fields from error payloads
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});