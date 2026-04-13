import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

interface ServiceError {
  status: number;
  message: string;
}

function isServiceError(err: unknown): err is ServiceError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    'message' in err &&
    typeof (err as ServiceError).status === 'number'
  );
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (isServiceError(err)) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  logger.error('Unhandled error', { err });
  res.status(500).json({ error: 'Internal server error' });
}
