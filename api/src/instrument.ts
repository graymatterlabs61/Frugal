import * as Sentry from '@sentry/node';
import { config } from './config/unifiedConfig.js';

Sentry.init({
  dsn: config.sentry.dsn,
  enabled: Boolean(config.sentry.dsn) && config.env === 'production',
  environment: config.env,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // spec §8: API keys + emails scrubbed from error payloads
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
