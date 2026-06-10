import { baseLayout, infoBox, statRow, divider } from "../../layout";

export interface TicketReceivedPayload {
  userName: string;
  ticketId: string;
  subject: string;
  messagePreview: string;
  priority?: "low" | "normal" | "high";
}

export function ticketReceivedSubject(payload: TicketReceivedPayload): string {
  return `[#${payload.ticketId}] We got your message — ${payload.subject}`;
}

export function ticketReceivedHtml(payload: TicketReceivedPayload): string {
  const firstName = payload.userName.split(" ")[0] ?? payload.userName;
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const slaMap: Record<string, string> = {
    high: "within 4 hours",
    normal: "within 24 hours",
    low: "within 48 hours",
  };
  const sla = slaMap[payload.priority ?? "normal"];
  const priorityLabel = (payload.priority ?? "Normal").charAt(0).toUpperCase() + (payload.priority ?? "normal").slice(1);

  const ticketIdValue = `<span style="font-family:'Courier New',Courier,monospace;color:#FF500B;">#${payload.ticketId}</span>`;

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">
      Got it, ${firstName}.
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#7a7690;line-height:1.65;${font}">
      We've received your support request and will respond
      <strong style="color:#e8e6f4;">${sla}</strong>.
    </p>

    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${statRow("Ticket ID", ticketIdValue, "#FF500B")}
        ${statRow("Subject", payload.subject)}
        ${statRow("Priority", priorityLabel)}
      </table>
    `)}

    <div style="height:16px;"></div>

    ${infoBox(`
      <p style="margin:0 0 6px;font-size:11px;color:#4a4758;text-transform:uppercase;letter-spacing:.06em;font-weight:700;${font}">Your message</p>
      <p style="margin:0;font-size:13px;color:#7a7690;line-height:1.6;${font}">${payload.messagePreview}${payload.messagePreview.length >= 200 ? "..." : ""}</p>
    `)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.6;${font}">
      Reply to this email to add more details.
      For urgent issues, include your ticket ID
      <strong style="color:#FF500B;">#${payload.ticketId}</strong> in the subject line.
    </p>
  `;

  return baseLayout(content, `Ticket #${payload.ticketId} received — we'll respond ${sla}.`);
}
