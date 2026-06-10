import { baseLayout, badge, infoBox, ctaButton, divider } from "../../layout";

export interface TicketResolvedPayload {
  userName: string;
  ticketId: string;
  subject: string;
  resolution: string;
  agentName?: string;
  feedbackUrl?: string;
}

export function ticketResolvedSubject(payload: TicketResolvedPayload): string {
  return `[#${payload.ticketId}] Resolved — ${payload.subject}`;
}

export function ticketResolvedHtml(payload: TicketResolvedPayload): string {
  const firstName = payload.userName.split(" ")[0] ?? payload.userName;
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const feedbackBlock = payload.feedbackUrl
    ? `<div style="margin-top:24px;text-align:center;">
        <p style="margin:0 0 14px;font-size:13px;color:#6b6880;${font}">Was this helpful?</p>
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
          <tr>
            <td style="padding-right:8px;">
              <a href="${payload.feedbackUrl}?rating=good"
                 style="display:inline-block;background:rgba(255,255,255,0.04);
                        border:1px solid rgba(255,255,255,0.12);border-radius:10px;
                        padding:11px 20px;font-size:14px;font-weight:600;
                        color:#c8c5d8;text-decoration:none;${font}">Yes</a>
            </td>
            <td>
              <a href="${payload.feedbackUrl}?rating=bad"
                 style="display:inline-block;background:rgba(255,255,255,0.04);
                        border:1px solid rgba(255,255,255,0.12);border-radius:10px;
                        padding:11px 20px;font-size:14px;font-weight:600;
                        color:#c8c5d8;text-decoration:none;${font}">No</a>
            </td>
          </tr>
        </table>
      </div>`
    : "";

  const content = `
    <div style="margin-bottom:20px;">${badge("Resolved", "#22c55e")}</div>

    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">
      Issue resolved, ${firstName}.
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#7a7690;line-height:1.65;${font}">
      Ticket <strong style="color:#FF500B;font-family:'Courier New',monospace;">#${payload.ticketId}</strong>
      &mdash; ${payload.subject}
    </p>

    ${infoBox(`
      ${payload.agentName ? `<p style="margin:0 0 10px;font-size:11px;color:#4a4758;text-transform:uppercase;letter-spacing:.06em;font-weight:700;${font}">From ${payload.agentName}</p>` : ""}
      <p style="margin:0;font-size:14px;color:#c8c5d8;line-height:1.7;white-space:pre-wrap;${font}">${payload.resolution}</p>
    `)}

    <div style="height:24px;"></div>

    ${ctaButton("Open Dashboard", "https://getfrugal.dev/dashboard")}

    ${feedbackBlock}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.6;${font}">
      Still having issues? Reply to this email and we'll reopen your ticket.
      Include <strong style="color:#FF500B;">#${payload.ticketId}</strong> in your reply.
    </p>
  `;

  return baseLayout(content, `Your support ticket #${payload.ticketId} has been resolved.`);
}
