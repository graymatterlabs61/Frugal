import { baseLayout, infoBox, statRow, divider, ctaButton } from "../layout";

export interface DigestProject {
  name: string;
  spendUsd: number;
  changePercent: number;
  provider: string;
}

export interface WeeklyDigestPayload {
  userName: string;
  weekLabel: string;
  totalSpendUsd: number;
  priorWeekSpendUsd: number;
  projects: DigestProject[];
  topProvider: string;
  alertsFired: number;
}

export function weeklyDigestSubject(payload: WeeklyDigestPayload): string {
  const delta = payload.totalSpendUsd - payload.priorWeekSpendUsd;
  const sign = delta >= 0 ? "+" : "-";
  const abs = Math.abs(delta).toFixed(2);
  return `Your Frugal digest — $${payload.totalSpendUsd.toFixed(2)} this week (${sign}$${abs} vs last week)`;
}

export function weeklyDigestHtml(payload: WeeklyDigestPayload): string {
  const firstName = payload.userName.split(" ")[0] ?? payload.userName;
  const totalDelta = payload.totalSpendUsd - payload.priorWeekSpendUsd;
  const totalDeltaColor = totalDelta > 0 ? "#ef4444" : "#22c55e";
  const totalDeltaSign = totalDelta >= 0 ? "+" : "";
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const projectRows = payload.projects
    .map((p) => {
      const changeColor = p.changePercent > 0 ? "#ef4444" : "#22c55e";
      const changeSign = p.changePercent >= 0 ? "+" : "";
      return `
        <tr>
          <td style="padding:10px 0;font-size:13px;color:#c8c5d8;border-bottom:1px solid rgba(255,255,255,0.05);${font}">
            ${p.name}
            <br/><span style="font-size:11px;color:#4a4758;">${p.provider}</span>
          </td>
          <td style="padding:10px 0;font-size:13px;font-weight:700;color:#e8e6f4;text-align:right;
                     border-bottom:1px solid rgba(255,255,255,0.05);${font}">
            $${p.spendUsd.toFixed(2)}
            <br/><span style="font-size:11px;color:${changeColor};">${changeSign}${p.changePercent.toFixed(0)}%</span>
          </td>
        </tr>`;
    })
    .join("");

  const heroBox = infoBox(`
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;color:#6b6880;text-transform:uppercase;letter-spacing:.06em;${font}">Total spend</p>
          <p style="margin:0;font-size:32px;font-weight:800;color:#f5f4ff;letter-spacing:-.03em;${font}">$${payload.totalSpendUsd.toFixed(2)}</p>
        </td>
        <td style="text-align:right;vertical-align:bottom;">
          <p style="margin:0;font-size:18px;font-weight:700;color:${totalDeltaColor};${font}">${totalDeltaSign}$${Math.abs(totalDelta).toFixed(2)}</p>
          <p style="margin:0;font-size:12px;color:#6b6880;${font}">vs last week</p>
        </td>
      </tr>
    </table>
  `);

  const statsBox = infoBox(`
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${statRow("Top provider", payload.topProvider)}
      ${statRow("Alerts fired", String(payload.alertsFired), payload.alertsFired > 0 ? "#FF500B" : "#22c55e")}
    </table>
  `);

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:#6b6880;text-transform:uppercase;letter-spacing:.07em;font-weight:700;${font}">Weekly Digest</p>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">Hey ${firstName},</h1>
    <p style="margin:0 0 24px;color:#7a7690;font-size:14px;${font}">${payload.weekLabel}</p>

    ${heroBox}

    ${payload.projects.length > 0 ? `
      <p style="margin:20px 0 8px;font-size:11px;color:#6b6880;text-transform:uppercase;letter-spacing:.07em;font-weight:700;${font}">Projects</p>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
        ${projectRows}
      </table>
    ` : ""}

    ${statsBox}

    <div style="height:24px;"></div>

    ${ctaButton("View full dashboard", "https://getfrugal.dev/dashboard")}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.6;${font}">
      To change digest frequency, visit
      <a href="https://getfrugal.dev/settings" style="color:#FF500B;text-decoration:none;">account settings</a>.
    </p>
  `;

  return baseLayout(content, `You spent $${payload.totalSpendUsd.toFixed(2)} on AI APIs this week.`);
}
