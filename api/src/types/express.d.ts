import type { Plan } from '@/utils/tier';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        plan: Plan;
      };
    }
  }
}

export {};