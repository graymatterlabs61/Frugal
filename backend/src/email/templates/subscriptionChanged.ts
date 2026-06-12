import { baseLayout, badge, infoBox, ghostButton, ctaButton, divider } from "../layout.js";

export interface SubscriptionUpgradedPayload {
  userName: string;
  plan: string;
  periodEnd?: string;
}

export interface SubscriptionCancelledPayload {
  userName: string;
  periodEnd: string;
}

export function subscriptionUpgradedSubject(payload: SubscriptionUpgradedPayload): string {
  return `You're on Frugal ${capitalize(payload.plan)}`;
}

export function subscriptionCancelledSubject(): string {
  return "Your Frugal Pro subscription has been cancelled";
}

export function subscriptionUpgradedHtml(payload: SubscriptionUpgradedPayload): string {
  const firstName = payload.userName.split(" ")[0] ?? payload.userName;
  const planLabel = capitalize(payload.plan);
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const perks: Record<string, string[]> = {
    pro: [
      "Up to 10 projects",
      "Unlimited API connections",
      "1-minute polling interval",
      "Email + Slack alerts",
      "Weekly spend digest",
    ],
    team: [
      "Unlimited projects",
      "Unlimited API connections",
      "1-minute polling",
      "Team member invites",
      "Priority support",
    ],
  };

  const planPerks = perks[payload.plan.toLowerCase()] ?? perks["pro"] ?? [];

  const perkRows = planPerks.map((p, i) => `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:#c8c5d8;${font}
                 ${i > 0 ? "border-top:1px solid rgba(255,255,255,0.05);" : ""}">
        <span style="color:#22c55e;margin-right:8px;font-weight:700;">&check;</span>${p}
      </td>
    </tr>`).join("");

  const content = `
    <div style="margin-bottom:20px;">${badge(`${planLabel} Plan`, "#22c55e")}</div>

    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">
      Welcome to ${planLabel}, ${firstName}.
    </h1>
    <p style="margin:0 0 24px;color:#7a7690;font-size:14px;line-height:1.5;${font}">
      Your subscription is active. Here's what you now have access to:
    </p>

    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${perkRows}
      </table>
    `)}

    <div style="height:24px;"></div>

    ${ctaButton("Go to dashboard", "https://getfrugal.dev/dashboard")}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.6;${font}">
      Manage your billing at
      <a href="https://getfrugal.dev/settings/billing" style="color:#FF500B;text-decoration:none;">getfrugal.dev/settings/billing</a>.
      ${payload.periodEnd ? `<br/>Current period ends ${formatDate(payload.periodEnd)}.` : ""}
    </p>
  `;

  return baseLayout(content, `Your Frugal ${planLabel} plan is now active.`);
}

export function subscriptionCancelledHtml(payload: SubscriptionCancelledPayload): string {
  const firstName = payload.userName.split(" ")[0] ?? payload.userName;
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const freePerks = ["1 project", "1 API connection", "5-minute polling", "Email alerts"];
  const perkRows = freePerks.map((p, i) => `
    <tr>
      <td style="padding:7px 0;font-size:14px;color:#c8c5d8;${font}
                 ${i > 0 ? "border-top:1px solid rgba(255,255,255,0.05);" : ""}">
        <span style="color:#22c55e;margin-right:8px;font-weight:700;">&check;</span>${p}
      </td>
    </tr>`).join("");

  const content = `
    <div style="margin-bottom:20px;">${badge("Subscription Cancelled", "#6b6880")}</div>

    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f5f4ff;letter-spacing:-0.3px;${font}">
      Sorry to see you go, ${firstName}.
    </h1>
    <p style="margin:0 0 24px;color:#7a7690;font-size:14px;line-height:1.5;${font}">
      Your Frugal Pro subscription has been cancelled. You'll retain Pro access until
      <strong style="color:#e8e6f4;">${formatDate(payload.periodEnd)}</strong>,
      then roll back to the free plan.
    </p>

    ${infoBox(`
      <p style="margin:0 0 10px;font-size:12px;color:#6b6880;text-transform:uppercase;letter-spacing:.06em;font-weight:700;${font}">On the free plan you'll keep</p>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${perkRows}
      </table>
    `)}

    <div style="height:24px;"></div>

    ${ghostButton("Reactivate anytime", "https://getfrugal.dev/pricing")}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.6;${font}">
      If this was a mistake, resubscribe at
      <a href="https://getfrugal.dev/pricing" style="color:#FF500B;text-decoration:none;">getfrugal.dev/pricing</a>
      before ${formatDate(payload.periodEnd)}.
    </p>
  `;

  return baseLayout(content, `Your Pro access continues until ${formatDate(payload.periodEnd)}.`);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
