import { baseLayout, ctaButton, codeBlock, warningBox, divider } from "../layout.js";

export interface MagicLinkPayload {
  confirmationUrl: string;
  otp?: string;
  expiresInMinutes?: number;
}

export function magicLinkSubject(): string {
  return "Your Frugal sign-in link";
}

export function magicLinkHtml(payload: MagicLinkPayload): string {
  const expiry = payload.expiresInMinutes ?? 60;
  const expiryLabel = expiry < 60 ? `${expiry} minutes` : `${expiry / 60} hour`;
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const otpSection = payload.otp
    ? `<div style="margin-bottom:24px;">${codeBlock(payload.otp, "One-time code")}</div>`
    : "";

  const content = `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">
      Your sign-in link
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#7a7690;line-height:1.65;${font}">
      Click below to sign in instantly — no password needed.
      This link expires in <strong style="color:#e8e6f4;">${expiryLabel}</strong> and can only be used once.
    </p>

    <div style="margin-bottom:24px;">
      ${ctaButton("Sign In to Frugal", payload.confirmationUrl)}
    </div>

    ${otpSection}

    ${warningBox(`
      <p style="margin:0;font-size:13px;color:#c8c5d8;line-height:1.6;${font}">
        Only click this link if you requested to sign in to Frugal.
        Frugal will never ask for your password.
      </p>
    `)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.7;${font}">
      Link not working? Copy and paste into your browser:<br/>
      <a href="${payload.confirmationUrl}" style="color:#FF500B;text-decoration:none;word-break:break-all;">${payload.confirmationUrl}</a>
    </p>
  `;

  return baseLayout(content, `Your sign-in link — expires in ${expiryLabel}.`);
}
