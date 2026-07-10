declare global {
  namespace Express {
    interface Request {
      id: string;
      userId?: string;
      userPlan?: string;
    }
  }
}

export {};
