import { sendEmail } from '../emails/lib/send.js';

/**
 * Thin wrappers over the template layer (src/emails).
 *
 * Signatures are unchanged from the plain-text versions these replaced, so
 * auth.ts and AlertDispatchService keep working untouched — only what lands in
 * the inbox changed.
 */

export async function sendOtpEmail(params: {
  to: string;
  otp: string;
  purpose: 'sign-in' | 'email-verification' | 'forget-password' | 'change-email';
}): Promise<void> {
  await sendEmail(params.to, {
    type: 'verify-otp',
    // Pass the purpose through — a reset code that says "verify your email"
    // gives the recipient no way to tell a real message from a spoofed one.
    props: { code: params.otp, purpose: params.purpose, expiresInMinutes: 5 },
  });
}

export async function sendResetPasswordEmail(params: { to: string; url: string }): Promise<void> {
  await sendEmail(params.to, {
    type: 'password-reset',
    props: { url: params.url },
  });
}

/**
 * Link-based email verification.
 *
 * Superseded by the OTP flow (sendOtpEmail with purpose 'email-verification');
 * this stays until the web verify-email page switches to a code input, then it
 * and its better-auth wiring can go.
 */
export async function sendVerificationLinkEmail(params: { to: string; url: string }): Promise<void> {
  await sendEmail(params.to, {
    type: 'verify-link',
    props: { url: params.url },
  });
}

export async function sendWelcomeEmail(params: { to: string; name?: string }): Promise<void> {
  await sendEmail(params.to, {
    type: 'welcome',
    props: { name: params.name },
  });
}

export async function sendBudgetAlertEmail(params: {
  to: string;
  projectName: string;
  spendAtTrigger: number;
  limitUsd: number;
  actionTaken?: 'alert' | 'block' | 'throttle';
}): Promise<void> {
  await sendEmail(params.to, {
    type: 'budget-alert',
    props: {
      projectName: params.projectName,
      spendAtTrigger: params.spendAtTrigger,
      limitUsd: params.limitUsd,
      actionTaken: params.actionTaken,
    },
  });
}

export async function sendConnectionFailedEmail(params: {
  to: string;
  provider: string;
  projectName?: string;
  reason?: string;
  failingSince?: string;
}): Promise<void> {
  await sendEmail(params.to, {
    type: 'connection-failed',
    props: {
      provider: params.provider,
      projectName: params.projectName,
      reason: params.reason,
      failingSince: params.failingSince,
    },
  });
}

export async function sendConnectionConnectedEmail(params: {
  to: string;
  provider: string;
  projectName?: string;
  recovered?: boolean;
}): Promise<void> {
  await sendEmail(params.to, {
    type: 'connection-connected',
    props: {
      provider: params.provider,
      projectName: params.projectName,
      recovered: params.recovered,
    },
  });
}

export async function sendSupportReplyEmail(params: {
  to: string;
  name?: string;
  message: string;
  reference?: string;
}): Promise<void> {
  await sendEmail(params.to, {
    type: 'support-reply',
    props: { name: params.name, message: params.message, reference: params.reference },
  });
}
