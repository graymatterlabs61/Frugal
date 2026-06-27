import { z } from 'zod';

export const createOrgSchema = z.object({ name: z.string().min(1).max(100) }).strict();
export const updateOrgSchema = z.object({ name: z.string().min(1).max(100).optional() }).strict();
export const inviteSchema = z
  .object({ email: z.string().email(), role: z.enum(['admin', 'member', 'viewer']) })
  .strict();
export const updateRoleSchema = z.object({ role: z.enum(['admin', 'member', 'viewer']) }).strict();