import pino from 'pino';
import type { DestinationStream } from 'pino';
import { config } from '../config/unifiedConfig.js';

const redactPaths = [
  'req.headers.authorization',
  '*.authorization',
  '*.password',
  '*.passwordHash',
  '*.apiKey',
  '*.api_key_encrypted',
  'password',
  'apiKey',
];

export function createLogger(stream?: DestinationStream) {
  return pino(
    {
      // Explicit stream (tests) always logs; otherwise silent under test env
      level: stream ? 'info' : config.env === 'test' ? 'silent' : 'info',
      redact: { paths: redactPaths, censor: '[Redacted]' },
      base: { service: 'frugal-api' },
    },
    stream,
  );
}

export const logger = createLogger();
