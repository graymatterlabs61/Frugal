import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import type { FromKey } from './from.js';

import { WelcomeEmail, welcomeSubject, welcomeText, type WelcomeEmailProps } from '../templates/welcome.js';
import {
  VerifyOtpEmail,
  verifyOtpSubject,
  verifyOtpText,
  type VerifyOtpEmailProps,
} from '../templates/verify-otp.js';
import {
  VerifyLinkEmail,
  verifyLinkSubject,
  verifyLinkText,
  type VerifyLinkEmailProps,
} from '../templates/verify-link.js';
import {
  PasswordResetEmail,
  passwordResetSubject,
  passwordResetText,
  type PasswordResetEmailProps,
} from '../templates/password-reset.js';
import {
  BudgetAlertEmail,
  budgetAlertSubject,
  budgetAlertText,
  type BudgetAlertEmailProps,
} from '../templates/budget-alert.js';
import {
  ConnectionFailedEmail,
  connectionFailedSubject,
  connectionFailedText,
  type ConnectionFailedEmailProps,
} from '../templates/connection-failed.js';
import {
  ConnectionConnectedEmail,
  connectionConnectedSubject,
  connectionConnectedText,
  type ConnectionConnectedEmailProps,
} from '../templates/connection-connected.js';
import {
  WeeklyDigestEmail,
  weeklyDigestSubject,
  weeklyDigestText,
  type WeeklyDigestEmailProps,
} from '../templates/weekly-digest.js';
import { OfferEmail, offerText, type OfferEmailProps } from '../templates/offer.js';
import {
  SupportReplyEmail,
  supportReplySubject,
  supportReplyText,
  type SupportReplyEmailProps,
} from '../templates/support-reply.js';

/** Every email the app can send. Adding a case here is the only wiring needed. */
export type EmailPayload =
  | { type: 'welcome'; props: WelcomeEmailProps }
  | { type: 'verify-otp'; props: VerifyOtpEmailProps }
  | { type: 'verify-link'; props: VerifyLinkEmailProps }
  | { type: 'password-reset'; props: PasswordResetEmailProps }
  | { type: 'budget-alert'; props: BudgetAlertEmailProps }
  | { type: 'connection-failed'; props: ConnectionFailedEmailProps }
  | { type: 'connection-connected'; props: ConnectionConnectedEmailProps }
  | { type: 'weekly-digest'; props: WeeklyDigestEmailProps }
  | { type: 'offer'; props: OfferEmailProps; subject: string }
  | { type: 'support-reply'; props: SupportReplyEmailProps };

interface Resolved {
  element: ReactElement;
  subject: string;
  text: string;
  from: FromKey;
  /** Set when replies should go somewhere a human reads. */
  replyTo?: string;
}

export function resolve(payload: EmailPayload): Resolved {
  switch (payload.type) {
    case 'welcome':
      return {
        element: WelcomeEmail(payload.props),
        subject: welcomeSubject,
        text: welcomeText(payload.props),
        from: 'welcome',
      };
    case 'verify-otp':
      return {
        element: VerifyOtpEmail(payload.props),
        subject: verifyOtpSubject(payload.props),
        text: verifyOtpText(payload.props),
        from: 'noreply',
      };
    case 'verify-link':
      return {
        element: VerifyLinkEmail(payload.props),
        subject: verifyLinkSubject,
        text: verifyLinkText(payload.props),
        from: 'noreply',
      };
    case 'password-reset':
      return {
        element: PasswordResetEmail(payload.props),
        subject: passwordResetSubject,
        text: passwordResetText(payload.props),
        from: 'noreply',
      };
    case 'budget-alert':
      return {
        element: BudgetAlertEmail(payload.props),
        subject: budgetAlertSubject(payload.props),
        text: budgetAlertText(payload.props),
        from: 'alerts',
      };
    case 'connection-failed':
      return {
        element: ConnectionFailedEmail(payload.props),
        subject: connectionFailedSubject(payload.props),
        text: connectionFailedText(payload.props),
        from: 'alerts',
      };
    case 'connection-connected':
      return {
        element: ConnectionConnectedEmail(payload.props),
        subject: connectionConnectedSubject(payload.props),
        text: connectionConnectedText(payload.props),
        from: 'alerts',
      };
    case 'weekly-digest':
      return {
        element: WeeklyDigestEmail(payload.props),
        subject: weeklyDigestSubject(payload.props),
        text: weeklyDigestText(payload.props),
        from: 'digest',
      };
    case 'offer':
      return {
        element: OfferEmail(payload.props),
        subject: payload.subject,
        text: offerText(payload.props),
        from: 'marketing',
      };
    case 'support-reply':
      return {
        element: SupportReplyEmail(payload.props),
        subject: supportReplySubject,
        text: supportReplyText(payload.props),
        from: 'support',
        replyTo: 'support@getfrugal.dev',
      };
  }
}


/** Render a template to HTML without sending — used by tests, previews, and send(). */
export async function renderEmail(payload: EmailPayload): Promise<string> {
  return render(resolve(payload).element);
}
