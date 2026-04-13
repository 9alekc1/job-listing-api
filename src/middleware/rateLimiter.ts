import { Request, Response, NextFunction } from 'express';
import { redis } from '../db/redis';

const DAILY_LIMIT = 10;

export async function applyRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user!.id;
  const key = `apply:limit:${userId}`;

  const count = await redis.incr(key);

  if (count === 1) {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    const secondsUntilMidnight = Math.floor((midnight.getTime() - now.getTime()) / 1000);
    await redis.expire(key, secondsUntilMidnight);
  }

  if (count > DAILY_LIMIT) {
    res.status(429).json({ error: 'Daily application limit reached (10 per day)' });
    return;
  }

  next();
}
