import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/authService';
import { ConflictError, UnauthorizedError } from '@/utils/errors';
import type { UserRepository } from '@/repositories/UserRepository';
import type { User } from '@/db/schema';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  fullName: 'Test User',
  passwordHash: null,
  googleId: null,
  plan: 'free',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeMockRepo(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(undefined),
    findByEmail: vi.fn().mockResolvedValue(undefined),
    findByGoogleId: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue(mockUser),
    update: vi.fn().mockResolvedValue(mockUser),
    ...overrides,
  } as unknown as UserRepository;
}

describe('AuthService.register', () => {
  it('creates user and returns token', async () => {
    const repo = makeMockRepo({ findByEmail: vi.fn().mockResolvedValue(undefined) });
    const service = new AuthService(repo);
    const { user, token } = await service.register({
      email: 'new@example.com',
      password: 'SecurePass123',
    });
    expect(token).toBeTruthy();
    expect(user.email).toBe(mockUser.email);
    expect(repo.create).toHaveBeenCalledOnce();
  });

  it('throws ConflictError if email taken', async () => {
    const repo = makeMockRepo({ findByEmail: vi.fn().mockResolvedValue(mockUser) });
    const service = new AuthService(repo);
    await expect(
      service.register({ email: 'taken@example.com', password: 'SecurePass123' }),
    ).rejects.toThrow(ConflictError);
  });
});

describe('AuthService.login', () => {
  it('throws UnauthorizedError for unknown email', async () => {
    const repo = makeMockRepo({ findByEmail: vi.fn().mockResolvedValue(undefined) });
    const service = new AuthService(repo);
    // Even with unknown email, timing should not differ
    await expect(
      service.login({ email: 'ghost@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError for Google-only account', async () => {
    const googleUser = { ...mockUser, googleId: 'gid123', passwordHash: null };
    const repo = makeMockRepo({ findByEmail: vi.fn().mockResolvedValue(googleUser) });
    const service = new AuthService(repo);
    await expect(
      service.login({ email: googleUser.email, password: 'anything' }),
    ).rejects.toThrow(UnauthorizedError);
  });
});