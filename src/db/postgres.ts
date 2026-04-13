import { Pool, QueryResult } from 'pg';
import { env } from '../config/env';
import { logger } from '../config/logger';

const pool = new Pool({ connectionString: env.POSTGRES_URL });

export async function connectPostgres(): Promise<void> {
  const client = await pool.connect();
  client.release();
  logger.info('PostgreSQL connected');
}

export function query<T extends object>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
