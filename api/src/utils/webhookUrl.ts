/**
 * SSRF guard for any URL the server will POST to on a user's behalf (Slack/custom
 * alert webhooks). No API currently lets a user set these fields (direct DB write
 * only, per Plan 3) — this check exists so the dispatch layer itself refuses
 * dangerous URLs the moment such an endpoint ships, not only at input time.
 */
export function isSafeWebhookUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') return false;

  const host = parsed.hostname.toLowerCase();
  if (host === 'localhost' || host === '0.0.0.0' || host === '::1' || host === '') return false;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 10) return false; // 10.0.0.0/8
    if (a === 127) return false; // loopback
    if (a === 169 && b === 254) return false; // link-local, incl. cloud metadata endpoints
    if (a === 172 && b >= 16 && b <= 31) return false; // 172.16.0.0/12
    if (a === 192 && b === 168) return false; // 192.168.0.0/16
  }

  return true;
}
