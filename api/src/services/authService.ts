import * as argon2 from 'argon2';
import { OAuth2Client } from 'google-auth-library';
import { config } from '@/config/unifiedConfig';
import { ConflictError, UnauthorizedError, ForbiddenError } from '@/utils/errors';
import { signToken } from '@/middleware/auth';
import { UserRepository } from '@/repositories/UserRepository';
import type {
  RegisterInput,
  LoginInput,
  GoogleAuthInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from '@/validators/auth.schema';
import type { User } from '@/db/schema';

// Reuse client across requests — caches Google's public keys internally
const googleClient = new OAuth2Client(config.google.clientId);

const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
} as const;

// Dummy hash for constant-time rejection on login with unknown email
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$aaaaaaaaaaaaaaaaaaaaaa$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(input: RegisterInput): Promise<{ token: string; user: SafeUser }> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await argon2.hash(input.password, ARGON2_OPTIONS);

    const user = await this.userRepository.create({
      email: input.email,
      fullName: input.fullName ?? null,
      passwordHash,
      plan: 'free',
    });

    const token = signToken({ sub: user.id, email: user.email, plan: user.plan });
    return { token, user: toSafeUser(user) };
  }

  async login(input: LoginInput): Promise<{ token: string; user: SafeUser }> {
    const user = await this.userRepository.findByEmail(input.email);

    // Always run argon2.verify to prevent timing attacks
    const hashToVerify = user?.passwordHash ?? DUMMY_HASH;
    const valid = await argon2.verify(hashToVerify, input.password);

    if (!user || !valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError('This account uses Google login');
    }

    const token = signToken({ sub: user.id, email: user.email, plan: user.plan });
    return { token, user: toSafeUser(user) };
  }

  async googleAuth(input: GoogleAuthInput): Promise<{ token: string; user: SafeUser }> {
    const googleProfile = await verifyGoogleToken(input.idToken);

    let user = await this.userRepository.findByGoogleId(googleProfile.sub);

    if (!user) {
      // Check email collision
      const existing = await this.userRepository.findByEmail(googleProfile.email);
      if (existing) {
        // Link Google to existing account
        user = await this.userRepository.update(existing.id, {
          googleId: googleProfile.sub,
        });
      } else {
        user = await this.userRepository.create({
          email: googleProfile.email,
          fullName: googleProfile.name ?? null,
          googleId: googleProfile.sub,
          plan: 'free',
        });
      }
    }

    const token = signToken({ sub: user.id, email: user.email, plan: user.plan });
    return { token, user: toSafeUser(user) };
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedError();

    if (!user.passwordHash) {
      throw new ForbiddenError('Google-only accounts cannot set a password this way');
    }

    const valid = await argon2.verify(user.passwordHash, input.currentPassword);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');

    const newHash = await argon2.hash(input.newPassword, ARGON2_OPTIONS);
    await this.userRepository.update(userId, { passwordHash: newHash });
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedError();
    return toSafeUser(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
    const user = await this.userRepository.update(userId, input);
    return toSafeUser(user);
  }
}

// ─── Google token verification ─────────────────────────────────────────────

interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
}

async function verifyGoogleToken(idToken: string): Promise<GoogleProfile> {
  // verifyIdToken validates the JWT signature using Google's cached public keys —
  // no network round-trip per request, token never sent as a URL param.
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });
  } catch {
    throw new UnauthorizedError('Invalid Google token');
  }

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new UnauthorizedError('Invalid Google token');
  }

  return { sub: payload.sub, email: payload.email, name: payload.name };
}

// ─── Safe user shape (no passwordHash, no google credentials) ─────────────

export interface SafeUser {
  id: string;
  email: string;
  fullName: string | null;
  plan: User['plan'];
  stripeCustomerId: string | null;
  createdAt: Date | null;
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName ?? null,
    plan: user.plan,
    stripeCustomerId: user.stripeCustomerId ?? null,
    createdAt: user.createdAt ?? null,
  };
}