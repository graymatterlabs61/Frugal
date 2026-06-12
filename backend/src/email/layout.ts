/**
 * Email layout shell — Frugal brand
 *
 * Glass simulation is applied ONCE to the outer card only (purposeful elevation,
 * not decorative). No backdrop-filter — email clients can't render it.
 * Achieved via layered gradients, rgba borders, and a tight orange bloom shadow.
 *
 * Footer mirrors Footer.tsx structure: logo + attribution + social icons + legal nav.
 *
 * Ported from frontend/lib/email/layout.ts — pure string-returning functions,
 * no React/JSX dependencies.
 */

// Logo — hosted SVG for Gmail/Apple Mail/iOS; CSS F-box fallback for Outlook (blocks external images by default).
const LOGO_MARK = `<!--[if !mso]><!-->
<img src="https://getfrugal.dev/logo.svg" width="34" height="25" alt="Frugal"
     style="display:block;border:0;outline:none;text-decoration:none;" />
<!--<![endif]-->
<!--[if mso]><table cellpadding="0" cellspacing="0" role="presentation"><tr>
  <td width="28" height="28" style="width:28px;height:28px;background:#FF500B;border-radius:6px;
      text-align:center;vertical-align:middle;font-size:13px;font-weight:800;
      color:#ffffff;font-family:Arial,sans-serif;line-height:28px;">F</td>
</tr></table><![endif]-->`;

/** Primary email shell. Injects `content` HTML into the body section. */
export function baseLayout(content: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>Frugal</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width:600px) {
      .wrap { padding: 0 16px !important; }
      .card-body { padding: 24px 20px !important; }
      .card-header { padding: 18px 20px !important; }
    }
    @media (prefers-color-scheme: dark) {
      body, .bg { background-color: #06060f !important; }
    }
  </style>
</head>
<body class="bg" style="margin:0;padding:0;background:#06060f;-webkit-font-smoothing:antialiased;">

  ${preheader ? `<!-- Preheader: hidden preview text -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#06060f;">
    ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>` : ""}

  <table class="wrap" width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background:#06060f;padding:40px 24px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:560px;width:100%;">

          <!-- ═══════════════════════════════════════════════════
               CARD — glass simulation: purposeful single use.
               Layered gradient + rgba border + orange bloom glow.
               No backdrop-filter (no email client supports it).
               ═══════════════════════════════════════════════════ -->
          <tr>
            <td style="background:linear-gradient(160deg,#1e1b30 0%,#151220 50%,#100e1c 100%);
                        border:1px solid rgba(255,255,255,0.07);
                        border-radius:20px;
                        overflow:hidden;
                        box-shadow:0 0 64px 0 rgba(255,80,11,0.07),0 1px 0 0 rgba(255,255,255,0.04) inset;">

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

                <!-- Header: logo + wordmark -->
                <tr>
                  <td class="card-header"
                    style="padding:22px 32px;
                           background:linear-gradient(180deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0) 100%);
                           border-bottom:1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="vertical-align:middle;padding-right:9px;line-height:0;">
                          ${LOGO_MARK}
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-size:18px;font-weight:700;color:#f5f4ff;
                                       letter-spacing:-0.3px;line-height:1;
                                       font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
                            Frugal
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body: injected content -->
                <tr>
                  <td class="card-body" style="padding:32px 36px;">
                    ${content}
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════
               FOOTER — mirrors Footer.tsx structure:
               attribution · social icons · legal nav · copyright
               ═══════════════════════════════════════════════════ -->
          <tr>
            <td style="padding:28px 8px 52px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

                <!-- Attribution -->
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <p style="margin:0;font-size:11.5px;color:#524e64;line-height:1.7;
                               font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
                      A product of Gray Matter Labs
                      &nbsp;<span style="color:#3d3a50;">&middot;</span>&nbsp;
                      Made by Nilesh Kumar
                    </p>
                  </td>
                </tr>

                <!-- Social icons — inline SVG (Gmail/Apple Mail/mobile); MSO text fallback -->
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <table cellpadding="0" cellspacing="0" role="presentation" style="display:inline-table;">
                      <tr>
                        <!-- X / Twitter -->
                        <td style="padding:0 4px;">
                          <a href="https://twitter.com/frugalso"
                            style="display:inline-block;width:32px;height:32px;
                                   background:rgba(255,255,255,0.05);
                                   border:1px solid rgba(255,255,255,0.09);
                                   border-radius:8px;text-align:center;line-height:32px;
                                   text-decoration:none;vertical-align:middle;"
                            aria-label="Frugal on X">
                            <!--[if !mso]><!-->
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16" fill="none" style="display:inline-block;vertical-align:middle;margin-top:-1px;">
                              <path d="M12.6 1.5h2.3L9.9 7.2l5.9 7.8h-4.3l-3.3-4.4-3.8 4.4H2l5.4-6.2L1.9 1.5h4.4l3 4 3.3-4zm-.8 12.7h1.3L4.4 2.8H3L11.8 14.2z" fill="#7a7690"/>
                            </svg>
                            <!--<![endif]-->
                            <!--[if mso]><span style="font-size:10px;font-weight:700;color:#6b6880;font-family:Arial,sans-serif;">X</span><![endif]-->
                          </a>
                        </td>
                        <!-- LinkedIn -->
                        <td style="padding:0 4px;">
                          <a href="https://linkedin.com/company/frugalso"
                            style="display:inline-block;width:32px;height:32px;
                                   background:rgba(255,255,255,0.05);
                                   border:1px solid rgba(255,255,255,0.09);
                                   border-radius:8px;text-align:center;line-height:32px;
                                   text-decoration:none;vertical-align:middle;"
                            aria-label="Frugal on LinkedIn">
                            <!--[if !mso]><!-->
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16" fill="none" style="display:inline-block;vertical-align:middle;margin-top:-1px;">
                              <path d="M2.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM1 5.5h3V15H1V5.5zm5 0h2.9v1.3h.04c.4-.77 1.4-1.58 2.87-1.58 3.07 0 3.64 2.02 3.64 4.65V15h-3v-4.5c0-1.07-.02-2.45-1.49-2.45-1.5 0-1.72 1.17-1.72 2.37V15H6V5.5z" fill="#7a7690"/>
                            </svg>
                            <!--<![endif]-->
                            <!--[if mso]><span style="font-size:10px;font-weight:700;color:#6b6880;font-family:Arial,sans-serif;">in</span><![endif]-->
                          </a>
                        </td>
                        <!-- GitHub -->
                        <td style="padding:0 4px;">
                          <a href="https://github.com/graymaterlabs"
                            style="display:inline-block;width:32px;height:32px;
                                   background:rgba(255,255,255,0.05);
                                   border:1px solid rgba(255,255,255,0.09);
                                   border-radius:8px;text-align:center;line-height:32px;
                                   text-decoration:none;vertical-align:middle;"
                            aria-label="Frugal on GitHub">
                            <!--[if !mso]><!-->
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16" fill="none" style="display:inline-block;vertical-align:middle;margin-top:-1px;">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="#7a7690"/>
                            </svg>
                            <!--<![endif]-->
                            <!--[if mso]><span style="font-size:10px;font-weight:700;color:#6b6880;font-family:Arial,sans-serif;">GH</span><![endif]-->
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Legal nav -->
                <tr>
                  <td align="center" style="padding-bottom:10px;">
                    <span style="font-size:11px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
                      <a href="https://getfrugal.dev/privacy"
                        style="color:#524e64;text-decoration:none;">Privacy</a>
                      <span style="color:#3d3a50;padding:0 5px;">&middot;</span>
                      <a href="https://getfrugal.dev/terms"
                        style="color:#524e64;text-decoration:none;">Terms</a>
                      <span style="color:#3d3a50;padding:0 5px;">&middot;</span>
                      <a href="https://getfrugal.dev/cookies"
                        style="color:#524e64;text-decoration:none;">Cookies</a>
                      <span style="color:#3d3a50;padding:0 5px;">&middot;</span>
                      <a href="https://getfrugal.dev/refund"
                        style="color:#524e64;text-decoration:none;">Refunds</a>
                      <span style="color:#3d3a50;padding:0 5px;">&middot;</span>
                      <a href="https://getfrugal.dev/unsubscribe"
                        style="color:#524e64;text-decoration:none;">Unsubscribe</a>
                    </span>
                  </td>
                </tr>

                <!-- Copyright -->
                <tr>
                  <td align="center">
                    <span style="font-size:10.5px;color:#3d3a50;
                                 font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
                      &copy; 2026 Gray Matter Labs, Inc. All rights reserved.
                    </span>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Helper components ────────────────────────────────────────────────────────

/** Status badge chip */
export function badge(text: string, color: string): string {
  return `<span style="display:inline-block;
                        background:${color}1a;
                        color:${color};
                        border:1px solid ${color}33;
                        font-size:10.5px;font-weight:700;
                        padding:4px 11px;border-radius:6px;
                        text-transform:uppercase;letter-spacing:.07em;
                        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">${text}</span>`;
}

/** Section divider */
export function divider(): string {
  return `<div style="border-top:1px solid rgba(255,255,255,0.06);margin:24px 0;"></div>`;
}

/** Primary CTA button */
export function ctaButton(label: string, url: string, color = "#FF500B"): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td style="border-radius:10px;background:${color};">
        <a href="${url}"
          style="display:inline-block;padding:13px 26px;
                 font-size:14px;font-weight:600;color:#fff;
                 text-decoration:none;letter-spacing:-0.1px;
                 font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
          ${label} &rarr;
        </a>
      </td>
    </tr>
  </table>`;
}

/** Ghost / secondary button */
export function ghostButton(label: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td style="border-radius:10px;border:1px solid rgba(255,255,255,0.12);">
        <a href="${url}"
          style="display:inline-block;padding:13px 26px;
                 font-size:14px;font-weight:600;color:#c8c5d8;
                 text-decoration:none;letter-spacing:-0.1px;
                 font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
          ${label} &rarr;
        </a>
      </td>
    </tr>
  </table>`;
}

/** Dark info / callout box */
export function infoBox(content: string, accent = "rgba(255,255,255,0.04)"): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" width="100%">
    <tr>
      <td style="background:${accent};
                 border:1px solid rgba(255,255,255,0.06);
                 border-radius:12px;
                 padding:16px 20px;">
        ${content}
      </td>
    </tr>
  </table>`;
}

/** Orange-tinted callout box (for warnings / alerts) */
export function warningBox(content: string): string {
  return infoBox(content, "rgba(255,80,11,0.06)");
}

/** Two-col key/value row — use inside a <table> */
export function statRow(label: string, value: string, valueColor = "#e8e6f4"): string {
  return `<tr>
    <td style="padding:7px 0;font-size:13px;color:#6b6880;
               font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
               border-top:1px solid rgba(255,255,255,0.05);">${label}</td>
    <td style="padding:7px 0;font-size:13px;font-weight:600;
               color:${valueColor};text-align:right;
               border-top:1px solid rgba(255,255,255,0.05);
               font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">${value}</td>
  </tr>`;
}

/** OTP / code block */
export function codeBlock(code: string, label = "Code"): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td style="background:rgba(255,255,255,0.03);
                 border:1px solid rgba(255,255,255,0.08);
                 border-radius:14px;
                 padding:18px 28px;">
        <p style="margin:0 0 5px;font-size:10px;letter-spacing:.12em;
                   color:#3d3a4d;text-transform:uppercase;
                   font-family:'Courier New',Courier,monospace;">${label}</p>
        <p style="margin:0;font-size:36px;font-weight:700;
                   color:#FF500B;letter-spacing:.18em;
                   font-family:'Courier New',Courier,monospace;line-height:1;">${code}</p>
      </td>
    </tr>
  </table>`;
}
