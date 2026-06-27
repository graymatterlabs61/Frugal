import pino from 'pino';
import { config } from '@/config/unifiedConfig';

export const logger = pino({
  level: config.isProduction ? 'info' : 'debug',
  ...(config.isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss' },
        },
      }),
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.apiKey',
      'body.api_key',
      '*.passwordHash',
      '*.apiKeyEncrypted',
    ],
    censor: '[REDACTED]',
  },
});

export type Logger = typeof logger;