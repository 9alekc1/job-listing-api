import { query } from '../../db/postgres';
import { redis } from '../../db/redis';

interface Stats {
  totalJobs: number;
  applicationsToday: number;
}

export async function getStats(): Promise<Stats> {
  const cached = await redis.get('stats:summary');
  if (cached) return JSON.parse(cached) as Stats;

  const [jobsResult, appsResult] = await Promise.all([
    query<{ count: string }>(`SELECT COUNT(*) AS count FROM jobs WHERE status='open'`),
    query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM applications WHERE applied_at >= CURRENT_DATE`
    ),
  ]);

  const stats: Stats = {
    totalJobs: parseInt(jobsResult.rows[0]!.count, 10),
    applicationsToday: parseInt(appsResult.rows[0]!.count, 10),
  };

  await redis.set('stats:summary', JSON.stringify(stats), 'EX', 60);
  return stats;
}
