import { baseLayout, badge, infoBox, statRow, ctaButton, warningBox, divider } from "../layout.js";

export interface BudgetAlertPayload {
  projectName: string;
  periodLabel: string;
  spendUsd: number;
  limitUsd: number;
  percentUsed: number;
}

export function budgetAlertSubject(payload: BudgetAlertPayload): string {
  if (payload.percentUsed >= 100) {
    return `Budget limit hit: ${payload.projectName}`;
  }
  if (payload.percentUsed >= 90) {
    return `${payload.projectName} is at ${payload.percentUsed.toFixed(0)}% of budget`;
  }
  return `Budget alert: ${payload.projectName} at ${payload.percentUsed.toFixed(0)}%`;
}

export function budgetAlertHtml(payload: BudgetAlertPayload): string {
  const exceeded = payload.percentUsed >= 100;
  const color = exceeded ? "#ef4444" : "#FF500B";
  const statusText = exceeded ? "Budget Exceeded" : "Budget Warning";
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const remaining = payload.limitUsd - payload.spendUsd;
  const remainingText = exceeded
    ? `$${Math.abs(remaining).toFixed(2)} over limit`
    : `$${remaining.toFixed(2)} remaining`;

  const fillPct = Math.min(100, Math.round(payload.percentUsed));
  const emptyPct = 100 - fillPct;

  const progressBar = `
    <div style="height:12px;"></div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        ${fillPct > 0 ? `<td width="${fillPct}%" height="6" style="background:${color};height:6px;line-height:6px;font-size:0;">&nbsp;</td>` : ""}
        ${emptyPct > 0 ? `<td width="${emptyPct}%" height="6" style="background:rgba(255,255,255,0.06);height:6px;line-height:6px;font-size:0;">&nbsp;</td>` : ""}
      </tr>
    </table>`;

  const statBox = infoBox(`
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${statRow("Current spend", `$${payload.spendUsd.toFixed(2)}`)}
      ${statRow("Budget limit", `$${payload.limitUsd.toFixed(2)}`)}
      ${statRow(exceeded ? "Over by" : "Remaining", remainingText, color)}
    </table>
    ${progressBar}
  `);

  const alertBox = exceeded
    ? warningBox(`
        <p style="margin:0;font-size:13px;color:#c8c5d8;line-height:1.6;${font}">
          <strong style="color:#e8e6f4;">Budget limit reached.</strong>
          Review your spend and consider raising the limit or pausing usage.
        </p>
      `)
    : "";

  const content = `
    <div style="margin-bottom:20px;">${badge(statusText, color)}</div>

    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#f5f4ff;letter-spacing:-0.3px;${font}">
      ${payload.projectName}
    </h1>
    <p style="margin:0 0 24px;color:#7a7690;font-size:14px;line-height:1.5;${font}">
      ${payload.periodLabel} spend has reached
      <strong style="color:${color};">${payload.percentUsed.toFixed(0)}%</strong>
      of your budget limit.
    </p>

    ${statBox}

    ${exceeded ? `<div style="height:16px;"></div>${alertBox}` : ""}

    <div style="height:24px;"></div>

    ${ctaButton("View dashboard", "https://getfrugal.dev/dashboard", color)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.6;${font}">
      Manage budget rules at
      <a href="https://getfrugal.dev/dashboard" style="color:#FF500B;text-decoration:none;">getfrugal.dev/dashboard</a>.
    </p>
  `;

  const preheader = exceeded
    ? `${payload.projectName} has exceeded its $${payload.limitUsd.toFixed(2)} budget limit.`
    : `${payload.projectName} is at ${payload.percentUsed.toFixed(0)}% of its $${payload.limitUsd.toFixed(2)} limit.`;

  return baseLayout(content, preheader);
}
