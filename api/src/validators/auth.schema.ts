import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(128),
    fullName: z.string().min(1).max(100).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
  })
  .strict();

export const googleAuthSchema = z
  .object({
    idToken: z.string().min(1),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    fullName: z.string().min(1).max(100).optional(),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
