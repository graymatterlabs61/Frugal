import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { UserRepository } from '../../src/repositories/UserRepository.js';
import { NotFoundError } from '../../src/utils/errors.js';

describe('UserRepository (requires a reachable Postgres via DATABASE_URL)', () => {
  const repo = new UserRepository();

  it('creates and finds a user by email and id', async () => {
    const email = `test-${randomUUID()}@example.com`;
    const created = await repo.create({ email, passwordHash: 'hash', plan: 'free' });
    expect(created.id).toBeTruthy();
    expect(created.email).toBe(email);

    const byEmail = await repo.findByEmail(email);
    expect(byEmail?.id).toBe(created.id);

    const byId = await repo.findById(created.id);
    expect(byId?.email).toBe(email);
  });

  it('returns undefined for an unknown email', async () => {
    const result = await repo.findByEmail(`nobody-${randomUUID()}@example.com`);
    expect(result).toBeUndefined();
  });

  it('updates a user and bumps updatedAt', async () => {
    const email = `test-${randomUUID()}@example.com`;
    const created = await repo.create({ email, plan: 'free' });
    await new Promise((r) => setTimeout(r, 5));
    const updated = await repo.update(created.id, { fullName: 'New Name' });
    expect(updated.fullName).toBe('New Name');
    expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
  });

  it('throws NotFoundError when updating an unknown id', async () => {
    await expect(repo.update(randomUUID(), { fullName: 'Nobody' })).rejects.toThrow(
      NotFoundError,
    );
  });
});
