import { URL } from 'url';

// IPv4 ranges that must never receive outbound webhook requests
const BLOCKED_V4 = [
  /^127\./,                                         // loopback
  /^10\./,                                          // RFC1918
  /^172\.(1[6-9]|2\d|3[01])\./,                    // RFC1918
  /^192\.168\./,                                    // RFC1918
  /^169\.254\./,                                    // link-local / AWS IMDS
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,     // CGNAT RFC6598
  /^0\./,                                           // this-network
  /^192\.0\.0\./,                                   // IETF protocol assignments
  /^192\.0\.2\./,                                   // TEST-NET-1
  /^198\.51\.100\./,                                // TEST-NET-2
  /^203\.0\.113\./,                                 // TEST-NET-3
  /^240\./,                                         // reserved
];

const BLOCKED_V6 = [
  /^::1$/i,                   // loopback
  /^::/,                      // unspecified
  /^fc[0-9a-f]{2}:/i,        // ULA
  /^fd[0-9a-f]{2}:/i,        // ULA
  /^fe[89ab][0-9a-f]:/i,     // link-local
];

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost') return true;
  if (BLOCKED_V4.some((r) => r.test(hostname))) return true;
  if (BLOCKED_V6.some((r) => r.test(lower))) return true;
  return false;
}

/**
 * Validates that a webhook URL is safe to fetch:
 * - Must be http or https
 * - Must not target private/loopback/link-local IP ranges
 *
 * Throws if the URL is unsafe. No-ops on null/undefined.
 */
export function assertSafeWebhookUrl(rawUrl: string | null | undefined): void {
  if (!rawUrl) return;

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid webhook URL`);
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Webhook URL must use HTTP or HTTPS');
  }

  if (isBlockedHost(parsed.hostname)) {
    throw new Error('Webhook URL targets a blocked network address');
  }
}