import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer, emailOTP } from 'better-auth/plugins';
import { importPKCS8, SignJWT } from 'jose';
import { db } from './db/client.js';
import { config } from './config/unifiedConfig.js';
import { sendOtpEmail, sendResetPasswordEmail, sendVerificationLinkEmail } from './utils/email.js';
import * as authSchema from './db/authSchema.js';

async function generateAppleClientSecret(
  clientId: string,
  teamId: string,
  keyId: string,
  privateKey: string,
): Promise<string> {
  const key = await importPKCS8(privateKey, 'ES256');
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setSubject(clientId)
    .setAudience('https://appleid.apple.com')
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60)
    .sign(key);
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', usePlural: true, schema: authSchema }),
  baseURL: config.betterAuth.url,
  secret: config.betterAuth.secret,
  trustedOrigins: config.cors.origins,
  emailAndPassword: {
    enabled: true,
    // Without this a brand-new account gets a session immediately and lands on
    // the dashboard unverified, which is what was happening.
    requireEmailVerification: true,
    async sendResetPassword({ user, url }) {
      await sendResetPasswordEmail({ to: user.email, url });
    },
  },
  emailVerification: {
    // Kept as the fallback path. The emailOTP plugin's
    // overrideDefaultEmailVerification replaces this with a code at runtime,
    // so this only fires if that option is ever turned off.
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      await sendVerificationLinkEmail({ to: user.email, url });
    },
  },
  plugins: [
    bearer(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtpEmail({ to: email, otp, purpose: type });
      },
      // Replaces the link-based verification with a 6-digit code, so there's
      // one verification flow rather than two that can drift apart.
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 300,
      // Codes are short and guessable at scale; cap attempts and never store
      // the plaintext, so a database leak can't be replayed.
      allowedAttempts: 3,
      storeOTP: 'hashed',
    }),
  ],
  socialProviders: {
    ...(config.google.clientId && config.google.clientSecret
      ? { google: { clientId: config.google.clientId, clientSecret: config.google.clientSecret } }
      : {}),
    ...(config.github.clientId && config.github.clientSecret
      ? { github: { clientId: config.github.clientId, clientSecret: config.github.clientSecret } }
      : {}),
    ...(config.apple.clientId && config.apple.teamId && config.apple.keyId && config.apple.privateKey
      ? {
          apple: async () => ({
            clientId: config.apple.clientId!,
            clientSecret: await generateAppleClientSecret(
              config.apple.clientId!,
              config.apple.teamId!,
              config.apple.keyId!,
              config.apple.privateKey!,
            ),
            appBundleIdentifier: config.apple.appBundleIdentifier,
          }),
        }
      : {}),
  },
  user: {
    additionalFields: {
      plan: {
        type: ['free', 'plus', 'pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise'],
        required: false,
        defaultValue: 'free',
      },
      stripeCustomerId: { type: 'string', required: false, input: false },
      stripeSubscriptionId: { type: 'string', required: false, input: false },
    },
  },
  rateLimit: {
    enabled: true, // better-auth only enables this by default in production
    customRules: {
      '/sign-in/email': { window: 900, max: 5 }, // spec §8: 5 attempts / 15 min
    },
  },
});
