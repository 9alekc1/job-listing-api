import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const redis = new Redis(env.REDIS_URL, { lazyConnect: true });

export async function connectRedis(): Promise<void> {
  await redis.connect();
  logger.info('Redis connected');
}
