import { describe, it, expect } from 'vitest';
import { renderEmail, type EmailPayload } from '../../src/emails/lib/render.js';

/**
 * Every template must render. Typechecking doesn't catch a component that
 * throws at render time, and these only run in production otherwise.
 */
const SAMPLES: EmailPayload[] = [
  { type: 'welcome', props: { name: 'Alex' } },
  { type: 'verify-otp', props: { code: '482913' } },
  { type: 'verify-link', props: { url: 'https://getfrugal.dev/verify?token=abc123' } },
  { type: 'password-reset', props: { url: 'https://getfrugal.dev/reset-password?token=xyz789' } },
  {
    type: 'budget-alert',
    props: { projectName: 'Prod API', spendAtTrigger: 842.1, limitUsd: 1000 },
  },
  {
    type: 'connection-failed',
    props: { provider: 'OpenAI', projectName: 'Prod API', reason: '401 invalid_api_key' },
  },
  { type: 'connection-connected', props: { provider: 'Anthropic' } },
  {
    type: 'weekly-digest',
    props: {
      periodLabel: 'Aug 11 – Aug 17',
      totalUsd: 842.1,
      previousUsd: 960.4,
      providers: [
        { provider: 'OpenAI', costUsd: 420.5 },
        { provider: 'Anthropic', costUsd: 421.6 },
      ],
      alertCount: 2,
    },
  },
  {
    type: 'offer',
    subject: 'Test offer',
    props: {
      heading: 'Two months free on Pro',
      body: 'Upgrade before September and get 2 months on us.',
      ctaLabel: 'Upgrade',
      ctaUrl: 'https://getfrugal.dev/pricing',
      code: 'SHIPFAST',
      points: ['Unlimited providers', 'Slack alerts'],
      unsubscribeUrl: 'https://getfrugal.dev/unsubscribe?id=1',
    },
  },
  {
    type: 'support-reply',
    props: { name: 'Alex', message: 'How does polling work?', reference: 'REQ-1042' },
  },
];

describe('email templates', () => {
  it.each(SAMPLES.map((p) => [p.type, p] as const))('%s renders valid HTML', async (_type, payload) => {
    const html = await renderEmail(payload);

    expect(html).toContain('<html');
    // a11y: screen readers need an explicit language
    expect(html).toContain('lang="en"');
    expect(html.length).toBeGreaterThan(500);
    // Unrendered JSX/undefined leaking into the body is a silent content bug
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('[object Object]');
  });

  it('OTP email shows the code and has no call-to-action button', async () => {
    const html = await renderEmail({ type: 'verify-otp', props: { code: '482913' } });
    expect(html).toContain('482913');
    // A code-only email should give a phishing lookalike nothing to imitate:
    // standard footer nav is fine, a primary CTA button is not. The button is
    // the only element painted in the brand orange.
    expect(html).not.toContain(`background-color:${'#FF500B'}`);
  });

  it('password reset embeds the token URL in both button and fallback', async () => {
    const url = 'https://getfrugal.dev/reset-password?token=xyz789';
    const html = await renderEmail({ type: 'password-reset', props: { url } });
    // Appears twice: the button href and the copy-paste fallback
    expect(html.split('xyz789').length - 1).toBeGreaterThanOrEqual(2);
  });

  it('budget alert renders money and percentage correctly', async () => {
    const html = await renderEmail({
      type: 'budget-alert',
      props: { projectName: 'Prod API', spendAtTrigger: 842.1, limitUsd: 1000 },
    });
    expect(html).toContain('$842.10');
    expect(html).toContain('$1,000.00');
    expect(html).toContain('84%');
  });

  it('budget alert switches copy when the action was a block', async () => {
    const html = await renderEmail({
      type: 'budget-alert',
      props: {
        projectName: 'Prod API',
        spendAtTrigger: 1100,
        limitUsd: 1000,
        actionTaken: 'block',
      },
    });
    expect(html).toContain('blocked');
  });

  it('marketing email includes an unsubscribe link (CAN-SPAM/GDPR)', async () => {
    const html = await renderEmail({
      type: 'offer',
      subject: 'Test offer',
      props: {
        heading: 'Two months free',
        body: 'Upgrade before September.',
        ctaLabel: 'Upgrade',
        ctaUrl: 'https://getfrugal.dev/pricing',
        unsubscribeUrl: 'https://getfrugal.dev/unsubscribe?id=1',
      },
    });
    expect(html).toContain('unsubscribe?id=1');
    expect(html).toContain('Unsubscribe');
  });

  it('transactional emails do not carry an unsubscribe link', async () => {
    const html = await renderEmail({ type: 'password-reset', props: { url: 'https://x.dev/r' } });
    expect(html).not.toContain('Unsubscribe');
  });

  it('connection-failed states plainly that spend is untracked', async () => {
    const html = await renderEmail({
      type: 'connection-failed',
      props: { provider: 'OpenAI' },
    });
    expect(html.toLowerCase()).toContain('not being tracked');
  });

  it('digest handles a first week with no prior period', async () => {
    const html = await renderEmail({
      type: 'weekly-digest',
      props: { periodLabel: 'Aug 11 – Aug 17', totalUsd: 12.5, providers: [] },
    });
    expect(html).toContain('No usage recorded');
  });
});
