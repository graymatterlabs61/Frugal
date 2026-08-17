/**
 * Renders every template to emails-preview/*.html for eyeballing in a browser.
 *
 *   npm run email:preview
 *
 * Templates are visual; the unit tests prove they render but not that they
 * look right. Sample props here double as the canonical "what does this
 * template expect" reference.
 */
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderEmail, type EmailPayload } from './lib/render.js';
import { SITE_URL } from './lib/tokens.js';

const SAMPLES: Record<string, EmailPayload> = {
  welcome: { type: 'welcome', props: { name: 'Alex' } },
  'verify-otp': { type: 'verify-otp', props: { code: '482913' } },
  'verify-link': {
    type: 'verify-link',
    props: { url: 'https://getfrugal.dev/verify?token=sample' },
  },
  'password-reset': {
    type: 'password-reset',
    props: { url: 'https://getfrugal.dev/reset-password?token=sample' },
  },
  'budget-alert': {
    type: 'budget-alert',
    props: { projectName: 'Prod API', spendAtTrigger: 842.1, limitUsd: 1000 },
  },
  'budget-alert-blocked': {
    type: 'budget-alert',
    props: { projectName: 'Prod API', spendAtTrigger: 1100, limitUsd: 1000, actionTaken: 'block' },
  },
  'connection-failed': {
    type: 'connection-failed',
    props: { provider: 'OpenAI', projectName: 'Prod API', reason: '401 invalid_api_key' },
  },
  'connection-connected': { type: 'connection-connected', props: { provider: 'Anthropic' } },
  'weekly-digest': {
    type: 'weekly-digest',
    props: {
      periodLabel: 'Aug 11 – Aug 17',
      totalUsd: 842.1,
      previousUsd: 960.4,
      providers: [
        { provider: 'OpenAI', costUsd: 512.4 },
        { provider: 'Anthropic', costUsd: 218.9 },
        { provider: 'Replicate', costUsd: 82.3 },
        { provider: 'fal.ai', costUsd: 28.5 },
      ],
      alertCount: 2,
    },
  },
  offer: {
    type: 'offer',
    subject: 'Two months free on Pro',
    props: {
      heading: 'Two months free on Pro',
      body: 'Upgrade before September and get two months on us.',
      ctaLabel: 'Upgrade to Pro',
      ctaUrl: 'https://getfrugal.dev/pricing',
      code: 'SHIPFAST',
      points: ['Unlimited providers', 'Slack + webhook alerts', '12 months of history'],
      unsubscribeUrl: 'https://getfrugal.dev/unsubscribe?id=sample',
    },
  },
  'support-reply': {
    type: 'support-reply',
    props: {
      name: 'Alex',
      message: 'How quickly does polling pick up a new key?',
      reference: 'REQ-1042',
    },
  },
};

const outDir = join(process.cwd(), 'emails-preview');
mkdirSync(join(outDir, 'email'), { recursive: true });

// Images are referenced absolutely so they resolve in a real inbox; for local
// preview, copy them in and point at the copy so the layout renders complete.
copyFileSync(
  join(process.cwd(), '..', 'web', 'public', 'email', 'logo@4x.png'),
  join(outDir, 'email', 'logo@4x.png'),
);

for (const [name, payload] of Object.entries(SAMPLES)) {
  const html = (await renderEmail(payload)).replaceAll(`${SITE_URL}/email/`, './email/');
  writeFileSync(join(outDir, `${name}.html`), html);
  console.log(`  ${name}.html`);
}

console.log(`\n${Object.keys(SAMPLES).length} templates → ${outDir}`);
