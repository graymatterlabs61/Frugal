import { baseLayout, ctaButton, infoBox, divider, badge } from "../../layout";

export interface AnnouncementFeature {
  icon: string;
  title: string;
  description: string;
}

export interface AnnouncementPayload {
  userName: string;
  headline: string;
  subheadline: string;
  body: string;
  features?: AnnouncementFeature[];
  ctaLabel: string;
  ctaUrl: string;
  tag?: string;
}

export function announcementSubject(payload: AnnouncementPayload): string {
  return payload.headline;
}

export function announcementHtml(payload: AnnouncementPayload): string {
  const firstName = payload.userName.split(" ")[0] ?? payload.userName;
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const featureRows = payload.features?.map((f, i) => `
    <tr>
      <td style="padding:10px 0;vertical-align:top;width:28px;${i > 0 ? "border-top:1px solid rgba(255,255,255,0.05);" : ""}">
        <span style="font-size:18px;line-height:1;">${f.icon}</span>
      </td>
      <td style="padding:10px 0 10px 12px;vertical-align:top;${i > 0 ? "border-top:1px solid rgba(255,255,255,0.05);" : ""}">
        <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#e8e6f4;${font}">${f.title}</p>
        <p style="margin:0;font-size:13px;color:#7a7690;line-height:1.5;${font}">${f.description}</p>
      </td>
    </tr>`).join("") ?? "";

  const content = `
    ${payload.tag ? `<div style="margin-bottom:20px;">${badge(payload.tag, "#FF500B")}</div>` : ""}

    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">
      Hey ${firstName},
    </h1>
    <p style="margin:0 0 6px;font-size:19px;font-weight:700;color:#e8e6f4;${font}">${payload.subheadline}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#7a7690;line-height:1.65;${font}">${payload.body}</p>

    ${featureRows ? infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${featureRows}
      </table>
    `) : ""}

    ${featureRows ? `<div style="height:24px;"></div>` : ""}

    ${ctaButton(payload.ctaLabel, payload.ctaUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.6;${font}">
      You're receiving this because you have a Frugal account.
      <a href="https://getfrugal.dev/unsubscribe" style="color:#4a4758;text-decoration:underline;">Unsubscribe</a>
    </p>
  `;

  return baseLayout(content, payload.subheadline);
}
