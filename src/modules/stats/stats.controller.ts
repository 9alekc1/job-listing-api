import { Request, Response, NextFunction } from 'express';
import * as statsService from './stats.service';

export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await statsService.getStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
}
