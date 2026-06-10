import { baseLayout, badge, warningBox, ctaButton, divider } from "../layout";

export interface ConnectionFailedPayload {
  projectName: string;
  provider: string;
  reason: "invalid_key" | "rate_limited" | "provider_error";
}

export function connectionFailedSubject(payload: ConnectionFailedPayload): string {
  return `Connection issue: ${payload.provider} key for ${payload.projectName}`;
}

export function connectionFailedHtml(payload: ConnectionFailedPayload): string {
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;";

  const reasonMessages: Record<ConnectionFailedPayload["reason"], { title: string; body: string; action: string }> = {
    invalid_key: {
      title: "API key is invalid or expired",
      body: "Frugal could not authenticate with the provider. The key may have been rotated, revoked, or entered incorrectly.",
      action: "Update your API key in connection settings to resume polling.",
    },
    rate_limited: {
      title: "Rate limited by provider",
      body: "The usage API returned a rate-limit response. Frugal will retry automatically on the next polling cycle.",
      action: "No action needed — polling will resume shortly.",
    },
    provider_error: {
      title: "Provider API error",
      body: "The provider's usage endpoint returned an unexpected error. This is usually temporary.",
      action: "No action needed — Frugal will retry. If this persists, check the provider's status page.",
    },
  };

  const { title, body, action } = reasonMessages[payload.reason];

  const content = `
    <div style="margin-bottom:20px;">${badge("Connection Issue", "#FF500B")}</div>

    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#f5f4ff;letter-spacing:-0.3px;${font}">
      ${payload.provider} &middot; ${payload.projectName}
    </h1>
    <p style="margin:0 0 24px;color:#7a7690;font-size:14px;line-height:1.5;${font}">
      Frugal couldn't fetch usage data from this connection.
    </p>

    ${warningBox(`
      <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#e8e6f4;${font}">${title}</p>
      <p style="margin:0 0 12px;font-size:13px;color:#7a7690;line-height:1.6;${font}">${body}</p>
      <p style="margin:0;font-size:13px;color:#FF500B;line-height:1.6;font-weight:600;${font}">${action}</p>
    `)}

    <div style="height:24px;"></div>

    ${ctaButton("Manage connections", "https://getfrugal.dev/dashboard")}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#4a4758;line-height:1.6;${font}">
      While this connection is failing, spend tracking for
      <strong style="color:#c8c5d8;">${payload.projectName}</strong> may be incomplete.
    </p>
  `;

  return baseLayout(content, `Frugal couldn't reach your ${payload.provider} connection for ${payload.projectName}.`);
}
