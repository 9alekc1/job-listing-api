declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'seeker' | 'employer' };
    }
  }
}

export {};
