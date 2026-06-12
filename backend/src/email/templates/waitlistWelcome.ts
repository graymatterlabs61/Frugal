import { baseLayout, ctaButton, infoBox, divider, badge } from "../layout.js";

export interface WaitlistWelcomePayload {
  email: string;
  position?: number;
  referralCode?: string;
}

export function waitlistWelcomeSubject(): string {
  return "You're on the Frugal waitlist";
}

export function waitlistWelcomeHtml(payload: WaitlistWelcomePayload): string {
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const positionBlock = payload.position
    ? `<p style="margin:0 0 24px;font-size:14px;color:#7a7690;line-height:1.5;${font}">
        You're <strong style="color:#e8e6f4;">#${payload.position}</strong> on the list.
        We'll email you when your spot opens up.
       </p>`
    : `<p style="margin:0 0 24px;font-size:14px;color:#7a7690;line-height:1.5;${font}">
        We'll email you as soon as your spot opens up.
       </p>`;

  const referralBlock = payload.referralCode
    ? `<div style="margin-top:20px;">
        <p style="margin:0 0 8px;font-size:11px;color:#6b6880;text-transform:uppercase;letter-spacing:.07em;font-weight:700;${font}">Move up the list — share your link</p>
        <table cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="background:rgba(255,255,255,0.04);border:1px dashed rgba(255,80,11,0.4);
                       border-radius:10px;padding:12px 24px;">
              <span style="font-size:13px;color:#FF500B;font-family:'Courier New',Courier,monospace;word-break:break-all;">
                https://getfrugal.dev/?ref=${payload.referralCode}
              </span>
            </td>
          </tr>
        </table>
      </div>`
    : "";

  const content = `
    <div style="margin-bottom:20px;">${badge("Waitlist", "#FF500B")}</div>

    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">
      You're in.
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:#7a7690;line-height:1.65;${font}">
      Thanks for signing up for Frugal. We're letting people in as we scale.
    </p>

    ${positionBlock}

    ${infoBox(`
      <p style="margin:0 0 10px;font-size:12px;color:#6b6880;text-transform:uppercase;letter-spacing:.06em;font-weight:700;${font}">What Frugal does</p>
      <p style="margin:0 0 8px;font-size:14px;color:#c8c5d8;line-height:1.6;${font}">
        Track spend across OpenAI, Anthropic, Replicate, and more — all in one place.
        Set budget limits. Get alerted before you go over.
      </p>
      ${referralBlock}
    `)}

    <div style="height:24px;"></div>

    ${ctaButton("Follow us for updates", "https://twitter.com/frugalso")}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.6;${font}">
      Questions? Reply to this email or reach us at
      <a href="mailto:hello@getfrugal.dev" style="color:#FF500B;text-decoration:none;">hello@getfrugal.dev</a>.
    </p>
  `;

  return baseLayout(content, "You're on the Frugal waitlist — we'll notify you when your spot opens.");
}
