import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer, emailOTP } from 'better-auth/plugins';
import { importPKCS8, SignJWT } from 'jose';
import { db } from './db/client.js';
import { config } from './config/unifiedConfig.js';
import { sendOtpEmail } from './utils/email.js';
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
  emailAndPassword: { enabled: true },
  plugins: [
    bearer(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtpEmail({ to: email, otp, purpose: type });
      },
      otpLength: 6,
      expiresIn: 300,
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
