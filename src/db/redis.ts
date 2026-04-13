import Redis from 'ioredis';
import { env } from '../config/env';

export const redis = new Redis(env.REDIS_URL, { lazyConnect: true });

export async function connectRedis(): Promise<void> {
  await redis.connect();
  console.log('Redis connected');
}
