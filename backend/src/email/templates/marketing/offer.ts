import { baseLayout, ctaButton, badge, divider } from "../../layout.js";

export interface OfferPayload {
  userName: string;
  offerHeadline: string;
  offerDescription: string;
  discountCode?: string;
  discountDisplay: string;
  originalPrice?: string;
  discountedPrice?: string;
  expiresLabel?: string;
  ctaLabel: string;
  ctaUrl: string;
  urgencyNote?: string;
}

export function offerSubject(payload: OfferPayload): string {
  return payload.offerHeadline;
}

export function offerHtml(payload: OfferPayload): string {
  const firstName = payload.userName.split(" ")[0] ?? payload.userName;
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const priceBlock = payload.originalPrice && payload.discountedPrice
    ? `<table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
        <tr>
          <td style="background:rgba(255,80,11,0.05);border:1px solid rgba(255,80,11,0.2);
                     border-radius:14px;padding:20px 28px;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b6880;text-decoration:line-through;${font}">${payload.originalPrice}</p>
            <p style="margin:0;font-size:36px;font-weight:800;color:#FF500B;letter-spacing:-1px;${font}">${payload.discountedPrice}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#7a7690;${font}">${payload.discountDisplay}</p>
          </td>
        </tr>
      </table>`
    : `<div style="margin-bottom:24px;">${badge(payload.discountDisplay, "#FF500B")}</div>`;

  const promoCodeBlock = payload.discountCode
    ? `<div style="margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:11px;color:#6b6880;text-transform:uppercase;letter-spacing:.07em;font-weight:700;${font}">Use code at checkout</p>
        <table cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="background:rgba(255,255,255,0.04);border:1px dashed rgba(255,80,11,0.4);
                       border-radius:10px;padding:12px 24px;">
              <span style="font-size:22px;font-weight:800;letter-spacing:4px;color:#FF500B;
                           font-family:'Courier New',Courier,monospace;">${payload.discountCode}</span>
            </td>
          </tr>
        </table>
      </div>`
    : "";

  const urgency = payload.urgencyNote
    ? `<p style="margin:0 0 20px;font-size:13px;color:#ef4444;font-weight:600;${font}">${payload.urgencyNote}</p>`
    : "";

  const content = `
    ${badge("Limited Offer", "#FF500B")}
    <div style="height:20px;"></div>

    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">
      Hey ${firstName},
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#7a7690;line-height:1.65;${font}">${payload.offerDescription}</p>

    ${priceBlock}
    ${promoCodeBlock}
    ${urgency}

    ${ctaButton(payload.ctaLabel, payload.ctaUrl)}

    ${payload.expiresLabel ? `<p style="margin:14px 0 0;font-size:12px;color:#4a4758;${font}">${payload.expiresLabel}</p>` : ""}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.6;${font}">
      You're receiving this because you have a Frugal account.
      <a href="https://getfrugal.dev/unsubscribe" style="color:#4a4758;text-decoration:underline;">Unsubscribe</a>
    </p>
  `;

  return baseLayout(content, payload.offerDescription);
}
