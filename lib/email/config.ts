export const FROM = {
  // Product emails — personal, onboarding
  welcome:   process.env.RESEND_FROM_WELCOME   ?? "Frugal <hello@getfrugal.dev>",
  // Transactional alerts — budget, connection failures
  alerts:    process.env.RESEND_FROM_ALERTS    ?? "Frugal Alerts <alerts@getfrugal.dev>",
  // Weekly / monthly spend digests
  digest:    process.env.RESEND_FROM_DIGEST    ?? "Frugal <digest@getfrugal.dev>",
  // Billing / subscription receipts
  billing:   process.env.RESEND_FROM_BILLING   ?? "Frugal Billing <billing@getfrugal.dev>",
  // Auth emails — magic link, password reset (no-reply)
  noreply:   process.env.RESEND_FROM_NOREPLY   ?? "Frugal <noreply@getfrugal.dev>",
  // Support confirmations and replies
  support:   process.env.RESEND_FROM_SUPPORT   ?? "Frugal Support <support@getfrugal.dev>",
  // Marketing — announcements, offers, re-engagement
  marketing: process.env.RESEND_FROM_MARKETING ?? "Frugal <hello@getfrugal.dev>",
} as const;

export type EmailPurpose = keyof typeof FROM;