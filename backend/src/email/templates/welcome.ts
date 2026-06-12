import { baseLayout, ctaButton, infoBox, divider } from "../layout.js";

export interface WelcomePayload {
  userName: string;
  userEmail: string;
}

export function welcomeSubject(): string {
  return "Welcome to Frugal — stop flying blind on AI costs";
}

export function welcomeHtml(payload: WelcomePayload): string {
  const firstName = payload.userName.split(" ")[0] ?? payload.userName;
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const steps: [string, string][] = [
    ["Create a project", "Group your API connections by product, team, or environment."],
    ["Add an API connection", "OpenAI, Anthropic, Replicate, Gemini, and more. Keys are AES-256 encrypted."],
    ["Set a budget rule", "Frugal fires before you hit the limit, not after."],
  ];

  const stepRows = steps.map(([title, desc], i) => `
    <tr>
      <td style="padding:12px 0;vertical-align:top;border-top:${i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none"};">
        <table cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="vertical-align:top;padding-right:14px;padding-top:2px;">
              <span style="display:inline-block;width:22px;height:22px;background:#FF500B;border-radius:50%;
                            font-size:11px;font-weight:800;color:#fff;text-align:center;line-height:22px;
                            ${font}">${i + 1}</span>
            </td>
            <td style="vertical-align:top;">
              <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#e8e6f4;${font}">${title}</p>
              <p style="margin:0;font-size:13px;color:#7a7690;line-height:1.5;${font}">${desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  const content = `
    <h1 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">
      Hey ${firstName}, welcome to Frugal.
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#7a7690;line-height:1.65;${font}">
      One place to track, budget, and get alerted on what you're spending across every AI API.
      Here's how to get started.
    </p>

    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${stepRows}
      </table>
    `)}

    <div style="height:24px;"></div>

    ${ctaButton("Open your dashboard", "https://getfrugal.dev/dashboard")}

    ${divider()}

    <p style="margin:0;font-size:12.5px;color:#4a4758;line-height:1.7;${font}">
      Free plan: 1 project &middot; 1 connection &middot; 5-minute polling<br/>
      <a href="https://getfrugal.dev/pricing" style="color:#FF500B;text-decoration:none;">Compare plans &rarr;</a>
    </p>
  `;

  return baseLayout(content, "Track AI API spend, set budgets, and get alerted before costs spiral.");
}
