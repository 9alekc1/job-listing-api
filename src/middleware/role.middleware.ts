import { Request, Response, NextFunction } from 'express';

export function requireRole(role: 'seeker' | 'employer') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      res.status(403).json({ error: `Requires ${role} role` });
      return;
    }
    next();
  };
}
