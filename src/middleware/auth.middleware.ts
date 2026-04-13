import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtAccessPayload } from '../types/common';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired access token' });
  }
}
