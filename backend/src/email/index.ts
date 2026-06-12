import { Resend } from "resend";
import { config } from "../config/unifiedConfig.js";
import { logger } from "../utils/logger.js";

// ── Templates ────────────────────────────────────────────────────────────────
import { budgetAlertSubject, budgetAlertHtml, type BudgetAlertPayload } from "./templates/budgetAlert.js";
import { welcomeSubject, welcomeHtml, type WelcomePayload } from "./templates/welcome.js";
import { magicLinkSubject, magicLinkHtml, type MagicLinkPayload } from "./templates/magicLink.js";
import { weeklyDigestSubject, weeklyDigestHtml, type WeeklyDigestPayload } from "./templates/weeklyDigest.js";
import {
  subscriptionUpgradedSubject, subscriptionUpgradedHtml,
  subscriptionCancelledSubject, subscriptionCancelledHtml,
  type SubscriptionUpgradedPayload,
  type SubscriptionCancelledPayload,
} from "./templates/subscriptionChanged.js";
import { connectionFailedSubject, connectionFailedHtml, type ConnectionFailedPayload } from "./templates/connectionFailed.js";
import { passwordResetSubject, passwordResetHtml, type PasswordResetPayload } from "./templates/passwordReset.js";
import { waitlistWelcomeSubject, waitlistWelcomeHtml, type WaitlistWelcomePayload } from "./templates/waitlistWelcome.js";
import { announcementSubject, announcementHtml, type AnnouncementPayload } from "./templates/marketing/announcement.js";
import { offerSubject, offerHtml, type OfferPayload } from "./templates/marketing/offer.js";
import { reengagementSubject, reengagementHtml, type ReengagementPayload } from "./templates/marketing/reengagement.js";
import { ticketReceivedSubject, ticketReceivedHtml, type TicketReceivedPayload } from "./templates/support/ticketReceived.js";
import { ticketResolvedSubject, ticketResolvedHtml, type TicketResolvedPayload } from "./templates/support/ticketResolved.js";

// ── Re-exports ───────────────────────────────────────────────────────────────
export type {
  BudgetAlertPayload,
  WelcomePayload,
  MagicLinkPayload,
  WeeklyDigestPayload,
  SubscriptionUpgradedPayload,
  SubscriptionCancelledPayload,
  ConnectionFailedPayload,
  PasswordResetPayload,
  WaitlistWelcomePayload,
  AnnouncementPayload,
  OfferPayload,
  ReengagementPayload,
  TicketReceivedPayload,
  TicketResolvedPayload,
};

// ── Core service ─────────────────────────────────────────────────────────────

interface SendOptions {
  to: string | string[];
  subject: string;
  html: string;
  from: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

class EmailService {
  private client: Resend | null;

  constructor() {
    this.client = config.resend.apiKey ? new Resend(config.resend.apiKey) : null;
  }

  async send(opts: SendOptions): Promise<{ id?: string; error?: string }> {
    if (!this.client) {
      logger.warn("email_skipped", { to: opts.to, subject: opts.subject, reason: "RESEND_API_KEY not set" });
      return { error: "email_disabled" };
    }
    try {
      const result = await this.client.emails.send({
        from: opts.from,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
        ...(opts.tags ? { tags: opts.tags } : {}),
      });
      if (result.error) {
        logger.error("email_send_failed", { to: opts.to, subject: opts.subject, error: result.error });
        return { error: result.error.message };
      }
      logger.info("email_sent", { id: result.data?.id, to: opts.to, subject: opts.subject });
      return { id: result.data?.id };
    } catch (err) {
      logger.error("email_send_error", { to: opts.to, error: err instanceof Error ? err.message : String(err) });
      return { error: "send_failed" };
    }
  }
}

export const emailService = new EmailService();

// ── Typed send helpers ───────────────────────────────────────────────────────

export async function sendBudgetAlert(to: string, payload: BudgetAlertPayload) {
  return emailService.send({
    from: config.resend.from.alerts,
    to,
    subject: budgetAlertSubject(payload),
    html: budgetAlertHtml(payload),
  });
}

export async function sendWelcome(to: string, payload: WelcomePayload) {
  return emailService.send({
    from: config.resend.from.welcome,
    to,
    subject: welcomeSubject(),
    html: welcomeHtml(payload),
  });
}

export async function sendMagicLink(to: string, payload: MagicLinkPayload) {
  return emailService.send({
    from: config.resend.from.noreply,
    to,
    subject: magicLinkSubject(),
    html: magicLinkHtml(payload),
  });
}

export async function sendWeeklyDigest(to: string, payload: WeeklyDigestPayload) {
  return emailService.send({
    from: config.resend.from.digest,
    to,
    subject: weeklyDigestSubject(payload),
    html: weeklyDigestHtml(payload),
  });
}

export async function sendSubscriptionUpgraded(to: string, payload: SubscriptionUpgradedPayload) {
  return emailService.send({
    from: config.resend.from.billing,
    to,
    subject: subscriptionUpgradedSubject(payload),
    html: subscriptionUpgradedHtml(payload),
  });
}

export async function sendSubscriptionCancelled(to: string, payload: SubscriptionCancelledPayload) {
  return emailService.send({
    from: config.resend.from.billing,
    to,
    subject: subscriptionCancelledSubject(),
    html: subscriptionCancelledHtml(payload),
  });
}

export async function sendConnectionFailed(to: string, payload: ConnectionFailedPayload) {
  return emailService.send({
    from: config.resend.from.alerts,
    to,
    subject: connectionFailedSubject(payload),
    html: connectionFailedHtml(payload),
  });
}

export async function sendPasswordReset(to: string, payload: PasswordResetPayload) {
  return emailService.send({
    from: config.resend.from.noreply,
    to,
    subject: passwordResetSubject(),
    html: passwordResetHtml(payload),
  });
}

export async function sendWaitlistWelcome(to: string, payload: WaitlistWelcomePayload) {
  return emailService.send({
    from: config.resend.from.marketing,
    to,
    subject: waitlistWelcomeSubject(),
    html: waitlistWelcomeHtml(payload),
  });
}

export async function sendAnnouncement(to: string, payload: AnnouncementPayload) {
  return emailService.send({
    from: config.resend.from.marketing,
    to,
    subject: announcementSubject(payload),
    html: announcementHtml(payload),
  });
}

export async function sendOffer(to: string, payload: OfferPayload) {
  return emailService.send({
    from: config.resend.from.marketing,
    to,
    subject: offerSubject(payload),
    html: offerHtml(payload),
  });
}

export async function sendReengagement(to: string, payload: ReengagementPayload) {
  return emailService.send({
    from: config.resend.from.marketing,
    to,
    subject: reengagementSubject(payload),
    html: reengagementHtml(payload),
  });
}

export async function sendTicketReceived(to: string, payload: TicketReceivedPayload) {
  return emailService.send({
    from: config.resend.from.support,
    to,
    subject: ticketReceivedSubject(payload),
    html: ticketReceivedHtml(payload),
  });
}

export async function sendTicketResolved(to: string, payload: TicketResolvedPayload) {
  return emailService.send({
    from: config.resend.from.support,
    to,
    subject: ticketResolvedSubject(payload),
    html: ticketResolvedHtml(payload),
  });
}
