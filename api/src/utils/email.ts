import { Resend } from 'resend';
import { config } from '../config/unifiedConfig.js';
import { logger } from './logger.js';

const SUBJECTS: Record<'sign-in' | 'email-verification' | 'forget-password' | 'change-email', string> = {
  'sign-in': 'Your Frugal sign-in code',
  'email-verification': 'Verify your Frugal email',
  'forget-password': 'Your Frugal password reset code',
  'change-email': 'Confirm your new Frugal email address',
};

export async function sendOtpEmail(params: {
  to: string;
  otp: string;
  purpose: 'sign-in' | 'email-verification' | 'forget-password' | 'change-email';
}): Promise<void> {
  const { to, otp, purpose } = params;

  if (!config.resend.apiKey || !config.resend.fromAddress) {
    logger.info({ to, purpose }, 'RESEND_API_KEY not set — skipping OTP email send');
    return;
  }

  const resend = new Resend(config.resend.apiKey);
  await resend.emails.send({
    from: config.resend.fromAddress,
    to,
    subject: SUBJECTS[purpose],
    text: `Your code is ${otp}. It expires in 5 minutes.`,
  });
}

export async function sendResetPasswordEmail(params: { to: string; url: string }): Promise<void> {
  const { to, url } = params;

  if (!config.resend.apiKey || !config.resend.fromAddress) {
    logger.info({ to }, 'RESEND_API_KEY not set — skipping password reset email send');
    return;
  }

  const resend = new Resend(config.resend.apiKey);
  await resend.emails.send({
    from: config.resend.fromAddress,
    to,
    subject: SUBJECTS['forget-password'],
    text: `Reset your Frugal password: ${url}\n\nIf you didn't request this, ignore this email.`,
  });
}

export async function sendVerificationLinkEmail(params: { to: string; url: string }): Promise<void> {
  const { to, url } = params;

  if (!config.resend.apiKey || !config.resend.fromAddress) {
    logger.info({ to }, 'RESEND_API_KEY not set — skipping verification email send');
    return;
  }

  const resend = new Resend(config.resend.apiKey);
  await resend.emails.send({
    from: config.resend.fromAddress,
    to,
    subject: SUBJECTS['email-verification'],
    text: `Verify your Frugal email: ${url}`,
  });
}

export async function sendBudgetAlertEmail(params: {
  to: string;
  projectName: string;
  spendAtTrigger: number;
  limitUsd: number;
}): Promise<void> {
  const { to, projectName, spendAtTrigger, limitUsd } = params;

  if (!config.resend.apiKey || !config.resend.fromAddress) {
    logger.info({ to, projectName }, 'RESEND_API_KEY not set — skipping budget alert email send');
    return;
  }

  const resend = new Resend(config.resend.apiKey);
  await resend.emails.send({
    from: config.resend.fromAddress,
    to,
    subject: `Budget alert: ${projectName}`,
    text: `${projectName} has spent $${spendAtTrigger.toFixed(2)} of its $${limitUsd.toFixed(2)} limit.`,
  });
}
