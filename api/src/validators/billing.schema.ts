import { z } from 'zod';

export const checkoutSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
}).strict();

export const portalSchema = z.object({
  returnUrl: z.string().url(),
}).strict();