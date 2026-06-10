/**
 * Sends the waitlist welcome email (with discount code) to a given address.
 * Usage: npx tsx --env-file .env.local scripts/test-waitlist-email.ts [email]
 */

import { sendWaitlistWelcome } from "../lib/email";

const TO = process.argv[2] ?? "neilkumaroff@gmail.com";

const result = await sendWaitlistWelcome(TO, { discountCode: "EARLY35" });
if (result.success) {
  console.log(`waitlist-welcome sent to ${TO} (id: ${result.messageId})`);
} else {
  console.error(`waitlist-welcome FAILED: ${result.error}`);
  process.exit(1);
}
