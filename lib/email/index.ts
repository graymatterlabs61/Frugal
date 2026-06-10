import { FROM } from "./config";

// ── Templates ────────────────────────────────────────────────────────────────
import { welcomeSubject, welcomeHtml, type WelcomePayload } from "./templates/welcome";
import { magicLinkSubject, magicLinkHtml, type MagicLinkPayload } from "./templates/magicLink";
import { passwordResetSubject, passwordResetHtml, type PasswordResetPayload } from "./templates/passwordReset";
import { budgetAlertSubject, budgetAlertHtml, type BudgetAlertPayload } from "./templates/budgetAlert";
import { weeklyDigestSubject, weeklyDigestHtml, type WeeklyDigestPayload } from "./templates/weeklyDigest";
import { connectionFailedSubject, connectionFailedHtml, type ConnectionFailedPayload } from "./templates/connectionFailed";
import {
  subscriptionUpgradedSubject, subscriptionUpgradedHtml,
  subscriptionCancelledSubject, subscriptionCancelledHtml,
  type SubscriptionUpgradedPayload,
  type SubscriptionCancelledPayload,
} from "./templates/subscriptionChanged";
import { announcementSubject, announcementHtml, type AnnouncementPayload } from "./templates/marketing/announcement";
import { offerSubject, offerHtml, type OfferPayload } from "./templates/marketing/offer";
import { reengagementSubject, reengagementHtml, type ReengagementPayload } from "./templates/marketing/reengagement";
import { ticketReceivedSubject, ticketReceivedHtml, type TicketReceivedPayload } from "./templates/support/ticketReceived";
import { ticketResolvedSubject, ticketResolvedHtml, type TicketResolvedPayload } from "./templates/support/ticketResolved";

// ── Re-exports ───────────────────────────────────────────────────────────────
export type {
  WelcomePayload,
  MagicLinkPayload,
  PasswordResetPayload,
  BudgetAlertPayload,
  WeeklyDigestPayload,
  ConnectionFailedPayload,
  SubscriptionUpgradedPayload,
  SubscriptionCancelledPayload,
  AnnouncementPayload,
  OfferPayload,
  ReengagementPayload,
  TicketReceivedPayload,
  TicketResolvedPayload,
};

// ── Core send primitive ──────────────────────────────────────────────────────
export type SendResult =
  | { success: true; messageId: string }
  | { success: false; error: string };

async function send(args: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping send");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send(args);
    if (error) return { success: false, error: JSON.stringify(error) };
    return { success: true, messageId: data!.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ── Onboarding / auth ────────────────────────────────────────────────────────
export const sendWelcome = (to: string, p: WelcomePayload) =>
  send({ from: FROM.welcome, to, subject: welcomeSubject(), html: welcomeHtml(p) });

export const sendMagicLink = (to: string, p: MagicLinkPayload) =>
  send({ from: FROM.noreply, to, subject: magicLinkSubject(), html: magicLinkHtml(p) });

export const sendPasswordReset = (to: string, p: PasswordResetPayload) =>
  send({ from: FROM.noreply, to, subject: passwordResetSubject(), html: passwordResetHtml(p) });

// ── Alerts / monitoring ──────────────────────────────────────────────────────
export const sendBudgetAlert = (to: string, p: BudgetAlertPayload) =>
  send({ from: FROM.alerts, to, subject: budgetAlertSubject(p), html: budgetAlertHtml(p) });

export const sendConnectionFailed = (to: string, p: ConnectionFailedPayload) =>
  send({ from: FROM.alerts, to, subject: connectionFailedSubject(p), html: connectionFailedHtml(p) });

// ── Digest ───────────────────────────────────────────────────────────────────
export const sendWeeklyDigest = (to: string, p: WeeklyDigestPayload) =>
  send({ from: FROM.digest, to, subject: weeklyDigestSubject(p), html: weeklyDigestHtml(p) });

// ── Billing ──────────────────────────────────────────────────────────────────
export const sendSubscriptionUpgraded = (to: string, p: SubscriptionUpgradedPayload) =>
  send({ from: FROM.billing, to, subject: subscriptionUpgradedSubject(p), html: subscriptionUpgradedHtml(p) });

export const sendSubscriptionCancelled = (to: string, p: SubscriptionCancelledPayload) =>
  send({ from: FROM.billing, to, subject: subscriptionCancelledSubject(), html: subscriptionCancelledHtml(p) });

// ── Marketing ────────────────────────────────────────────────────────────────
export const sendAnnouncement = (to: string, p: AnnouncementPayload) =>
  send({ from: FROM.marketing, to, subject: announcementSubject(p), html: announcementHtml(p) });

export const sendOffer = (to: string, p: OfferPayload) =>
  send({ from: FROM.marketing, to, subject: offerSubject(p), html: offerHtml(p) });

export const sendReengagement = (to: string, p: ReengagementPayload) =>
  send({ from: FROM.marketing, to, subject: reengagementSubject(p), html: reengagementHtml(p) });

// ── Support ──────────────────────────────────────────────────────────────────
export const sendTicketReceived = (to: string, p: TicketReceivedPayload) =>
  send({ from: FROM.support, to, subject: ticketReceivedSubject(p), html: ticketReceivedHtml(p) });

export const sendTicketResolved = (to: string, p: TicketResolvedPayload) =>
  send({ from: FROM.support, to, subject: ticketResolvedSubject(p), html: ticketResolvedHtml(p) });