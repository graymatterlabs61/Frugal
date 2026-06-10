import { baseLayout, infoBox, divider } from "../layout";

export interface WaitlistWelcomePayload {
  discountCode: string;
}

export function waitlistWelcomeSubject(): string {
  return "You're on the Frugal waitlist — 35% off locked in";
}

export function waitlistWelcomeHtml(payload: WaitlistWelcomePayload): string {
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";
  const mono = "font-family:'SF Mono',Consolas,'Liberation Mono',Menlo,monospace;";

  const content = `
    <h1 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#f5f4ff;letter-spacing:-0.4px;${font}">
      You're on the list.
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#7a7690;line-height:1.65;${font}">
      Frugal is one dashboard for everything you spend across OpenAI, Anthropic,
      Replicate, and fal.ai — with budget alerts that fire before the invoice does.
      We'll email you the moment it launches.
    </p>

    ${infoBox(`
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#7a7690;${font}">
        Your early-member discount — 35% off your first plan
      </p>
      <p style="margin:0;font-size:22px;font-weight:700;color:#FF500B;letter-spacing:2px;${mono}">
        ${payload.discountCode}
      </p>
    `)}

    ${divider()}

    <p style="margin:0;font-size:12.5px;color:#4a4758;line-height:1.7;${font}">
      You're receiving this because you joined the waitlist at
      <a href="https://getfrugal.dev" style="color:#FF500B;text-decoration:none;">getfrugal.dev</a>.
      Nothing else lands in your inbox until launch.
    </p>
  `;

  return baseLayout(content, "Your 35% early-member discount code for Frugal.");
}
