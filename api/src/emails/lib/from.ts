/**
 * Per-category sender identities.
 *
 * Auth-critical mail sends from noreply@ (users don't reply to it, and a
 * monitored inbox isn't expected). Marketing sends from hello@ — a real
 * replyable address reads better and helps deliverability. Monitoring mail
 * shares alerts@ so users can filter every connection/budget signal as one
 * identity. getfrugal.dev is domain-verified in Resend, so every local-part
 * below is already covered by SPF/DKIM — no extra DNS per address.
 *
 * Precedence: category env var → RESEND_FROM_ADDRESS → built-in default.
 * The middle step keeps the single-address config that's already deployed
 * working, so this doesn't silently start sending from new addresses.
 *
 * Reads process.env directly rather than unifiedConfig: that module validates
 * the whole app environment at import time, and rendering an email shouldn't
 * require a DATABASE_URL.
 */
const DEFAULTS = {
  noreply: 'Frugal <noreply@getfrugal.dev>',
  welcome: 'Frugal <welcome@getfrugal.dev>',
  alerts: 'Frugal Alerts <alerts@getfrugal.dev>',
  digest: 'Frugal Digest <digest@getfrugal.dev>',
  marketing: 'Frugal <hello@getfrugal.dev>',
  support: 'Frugal Support <support@getfrugal.dev>',
} as const;

const ENV_VARS: Record<FromKey, string> = {
  noreply: 'RESEND_FROM_NOREPLY',
  welcome: 'RESEND_FROM_WELCOME',
  alerts: 'RESEND_FROM_ALERTS',
  digest: 'RESEND_FROM_DIGEST',
  marketing: 'RESEND_FROM_MARKETING',
  support: 'RESEND_FROM_SUPPORT',
};

export type FromKey = keyof typeof DEFAULTS;

export function fromAddress(key: FromKey): string {
  return process.env[ENV_VARS[key]] || process.env.RESEND_FROM_ADDRESS || DEFAULTS[key];
}
