import { baseLayout, ctaButton, warningBox, divider } from "../layout.js";

export interface PasswordResetPayload {
  confirmationUrl: string;
  expiresInMinutes?: number;
}

export function passwordResetSubject(): string {
  return "Reset your Frugal password";
}

export function passwordResetHtml(payload: PasswordResetPayload): string {
  const expiry = payload.expiresInMinutes ?? 60;
  const expiryLabel = expiry < 60 ? `${expiry} minutes` : `${expiry / 60} hour`;
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const content = `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">
      Reset your password
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#7a7690;line-height:1.65;${font}">
      Someone requested a password reset for the Frugal account linked to this email.
      This link expires in <strong style="color:#e8e6f4;">${expiryLabel}</strong>.
      If this wasn't you, you can safely ignore this email.
    </p>

    <div style="margin-bottom:24px;">
      ${ctaButton("Set New Password", payload.confirmationUrl)}
    </div>

    ${warningBox(`
      <p style="margin:0;font-size:13px;color:#c8c5d8;line-height:1.6;${font}">
        <strong style="color:#e8e6f4;">Security note:</strong>
        Frugal staff will never ask for your password. Your API keys are encrypted with AES-256 and are not readable by anyone.
      </p>
    `)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.7;${font}">
      If the button doesn't work, copy this link:<br/>
      <a href="${payload.confirmationUrl}" style="color:#FF500B;text-decoration:none;word-break:break-all;">${payload.confirmationUrl}</a>
    </p>
  `;

  return baseLayout(content, "A password reset was requested for your Frugal account.");
}
