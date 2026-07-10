const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getfrugal.dev";

export function wishlistWelcomeHtml({
  email,
  referralCode,
  discountPercent,
}: {
  email: string;
  referralCode: string;
  discountPercent: number;
}) {
  const referralLink = `${SITE_URL}/wishlist?ref=${referralCode}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You are on the Frugal wishlist</title>
  <style>
    @font-face {
      font-family: 'ethnocentric';
      src: url('${SITE_URL}/font/ethnocentric/Ethnocentric-Regular.otf') format('opentype');
      font-weight: normal;
      font-style: normal;
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e5e5;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:60px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;text-align:left;">
          
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:48px; text-align:center; justify-content:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0;padding:0;">
                <tr>
                  <td valign="middle" style="padding-right:10px;">
                    <img src="${SITE_URL}/logo.svg" alt="Frugal Logo" width="40" height="40" style="display:block;border:0;outline:none;text-decoration:none;filter:drop-shadow(0px 0px 10px rgba(255,80,11,0.4));" />
                  </td>
                  <td valign="middle">
                    <span style="font-family:'ethnocentric',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:24px;letter-spacing:-0.02em;color:#ffffff;display:inline-block;padding-top:12px;">
                      Frugal
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding-bottom:24px;">
              <h1 style="margin:0;font-size:28px;font-weight:500;line-height:1.2;color:#ffffff;letter-spacing:-0.02em;">
                You are on the list.<br/>
                <span style="color:#FF500B;">${discountPercent}% off locked in.</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-bottom:40px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#a3a3a3;">
                Hi ${email.split("@")[0]},<br/><br/>
                Your launch discount is reserved. We will email you the moment Frugal goes live.
              </p>
            </td>
          </tr>

          <!-- Referral Section -->
          <tr>
            <td style="padding-bottom:40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px;background:#111111;border-radius:8px;border:1px solid #222222;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:500;letter-spacing:0.04em;color:#737373;text-transform:uppercase;">
                      Your referral link
                    </p>
                    <p style="margin:0 0 16px;font-size:14px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;word-break:break-all;">
                      <a href="${referralLink}" style="color:#ffffff;text-decoration:none;">${referralLink}</a>
                    </p>
                    <p style="margin:0;font-size:14px;color:#a3a3a3;line-height:1.5;">
                      Share this link. Every signup adds 1% to your discount, up to a maximum of 50%.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding-bottom:48px;">
              <a href="${referralLink}" style="display:inline-block;padding:12px 24px;background:#FF500B;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;border-radius:6px;">
                Share your link
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #222222;padding-top:24px;">
              <p style="margin:0;font-size:13px;color:#525252;line-height:1.5;">
                You are receiving this because you joined the Frugal wishlist.<br />
                <a href="${SITE_URL}" style="color:#525252;text-decoration:none;">${SITE_URL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function wishlistWelcomeText({
  email,
  referralCode,
  discountPercent,
}: {
  email: string;
  referralCode: string;
  discountPercent: number;
}) {
  const referralLink = `${SITE_URL}/wishlist?ref=${referralCode}`;
  return `FRUGAL

You are on the list. ${discountPercent}% off locked in.

Hi ${email.split("@")[0]},

Your launch discount is reserved. We will email you the moment Frugal goes live.

Your referral link:
${referralLink}

Share this link. Every signup adds 1% to your discount, up to a maximum of 50%.

— The Frugal team
${SITE_URL}
`;
}
