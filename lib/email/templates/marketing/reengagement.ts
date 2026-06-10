import { baseLayout, ctaButton, infoBox, divider } from "../../layout";

export interface ReengagementPayload {
  userName: string;
  daysSinceLastLogin: number;
  recentFeature?: {
    name: string;
    description: string;
    url: string;
  };
}

export function reengagementSubject(payload: ReengagementPayload): string {
  if (payload.daysSinceLastLogin >= 30) {
    return `${payload.userName.split(" ")[0]}, your AI costs are still running`;
  }
  return `Still tracking your AI spend, ${payload.userName.split(" ")[0]}?`;
}

export function reengagementHtml(payload: ReengagementPayload): string {
  const firstName = payload.userName.split(" ")[0] ?? payload.userName;
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const featureBlock = payload.recentFeature
    ? infoBox(`
        <p style="margin:0 0 4px;font-size:11px;color:#6b6880;text-transform:uppercase;letter-spacing:.06em;font-weight:700;${font}">What's new since you left</p>
        <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#e8e6f4;${font}">${payload.recentFeature.name}</p>
        <p style="margin:0 0 12px;font-size:13px;color:#7a7690;line-height:1.5;${font}">${payload.recentFeature.description}</p>
        <a href="${payload.recentFeature.url}" style="font-size:13px;color:#FF500B;text-decoration:none;font-weight:600;${font}">Learn more &rarr;</a>
      `)
    : "";

  const checklistItems = [
    "See your spend since last login",
    "Check if any budget rules fired",
    "Review API connections are still healthy",
  ];

  const checklistRows = checklistItems.map((item, i) => `
    <tr>
      <td style="padding:9px 0;font-size:14px;color:#c8c5d8;${font}
                 ${i > 0 ? "border-top:1px solid rgba(255,255,255,0.05);" : ""}">
        <span style="color:#FF500B;margin-right:10px;">&rarr;</span>${item}
      </td>
    </tr>`).join("");

  const content = `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">
      Hey ${firstName},
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#7a7690;line-height:1.65;${font}">
      You haven't logged into Frugal in ${payload.daysSinceLastLogin} days.
      In the meantime, your AI API bills have kept running.
      Come back and see where your money is going.
    </p>

    ${featureBlock}
    ${featureBlock ? `<div style="height:16px;"></div>` : ""}

    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${checklistRows}
      </table>
    `)}

    <div style="height:24px;"></div>

    ${ctaButton("Open Frugal Dashboard", "https://getfrugal.dev/dashboard")}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.6;${font}">
      No longer want these emails?
      <a href="https://getfrugal.dev/unsubscribe" style="color:#4a4758;text-decoration:underline;">Unsubscribe</a>
    </p>
  `;

  return baseLayout(content, `You haven't logged in for ${payload.daysSinceLastLogin} days — your AI costs are still running.`);
}
