import { Resend } from 'resend';
import { config } from '../../config/unifiedConfig.js';
import { logger } from '../../utils/logger.js';
import { fromAddress } from './from.js';
import { resolve, renderEmail, type EmailPayload } from './render.js';

export type { EmailPayload };
export { renderEmail };

/**
 * Render and send one email.
 *
 * No-ops (and says so) when Resend isn't configured, so local and test runs
 * don't need credentials. Throws on a real send failure — callers decide
 * whether that should fail their flow.
 */
export async function sendEmail(to: string, payload: EmailPayload): Promise<void> {
  if (!config.resend.apiKey) {
    logger.info({ to, type: payload.type }, 'RESEND_API_KEY not set — skipping email send');
    return;
  }

  const { subject, text, from, replyTo } = resolve(payload);
  const html = await renderEmail(payload);

  const sender = fromAddress(from);
  const resend = new Resend(config.resend.apiKey);
  const { data, error } = await resend.emails.send({
    from: sender,
    to,
    subject,
    html,
    // Always send a text part: providers score HTML-only mail worse, and some
    // clients render nothing without it.
    text,
    ...(replyTo ? { replyTo } : {}),
    tags: [{ name: 'template', value: payload.type }],
  });

  if (error) {
    logger.error(
      { to, from: sender, type: payload.type, err: error.message },
      'email send rejected by Resend',
    );
    throw new Error(`Resend send failed (${payload.type}): ${error.message}`);
  }

  // Log the provider's message id on success. Without this there's no way to
  // tell "we never sent it" from "we sent it and it bounced" — the two look
  // identical from the app side, and answering that question was otherwise
  // impossible without read access to the Resend account.
  logger.info(
    { to, from: sender, type: payload.type, resendId: data?.id },
    'email accepted by Resend',
  );
}

