import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name, role } = req.body as {
      email: string;
      password: string;
      name: string;
      role: 'seeker' | 'employer';
    };
    const result = await authService.register(email, password, name, role);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login(email, password);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await authService.refresh(refreshToken);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    await authService.logout(refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
