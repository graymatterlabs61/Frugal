import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { config } from "../config/unifiedConfig.js";
import type { UserRepository } from "../repositories/UserRepository.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors.js";

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    plan: string;
  };
}

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new ConflictError("An account with that email already exists");
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await this.userRepo.create({ email, passwordHash, fullName });
    const token = this.signToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        plan: user.plan,
      },
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      // Constant-time rejection: still verify against a dummy hash
      await argon2.verify(
        "$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        password
      );
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError("This account uses Google sign-in. Please sign in with Google.");
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = this.signToken(user.id);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        plan: user.plan,
      },
    };
  }

  signToken(userId: string): string {
    return jwt.sign({ sub: userId }, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresInSeconds,
    });
  }

  async loginWithGoogle(googleId: string, email: string, fullName: string): Promise<AuthResult> {
    const user = await this.userRepo.findOrCreateGoogleUser(googleId, email, fullName);
    const token = this.signToken(user.id);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        plan: user.plan,
      },
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.passwordHash) {
      throw new UnauthorizedError("This account uses Google sign-in. Please sign in with Google.");
    }

    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) throw new UnauthorizedError("Current password is incorrect");

    const newHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await this.userRepo.updatePassword(userId, newHash);
  }
}
