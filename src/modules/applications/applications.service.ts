import { query } from '../../db/postgres';
import { redis } from '../../db/redis';

interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  applied_at: Date;
}

interface ApplicationWithJob extends Application {
  title: string;
  company: string;
}

export async function applyToJob(userId: string, jobId: string) {
  const jobCheck = await query<{ id: string }>(
    `SELECT id FROM jobs WHERE id=$1 AND status='open'`,
    [jobId]
  );
  if (jobCheck.rows.length === 0) {
    throw { status: 404, message: 'Job not found or no longer open' };
  }

  const result = await query<Application>(
    `INSERT INTO applications(job_id, user_id)
     VALUES($1,$2)
     ON CONFLICT(job_id, user_id) DO NOTHING
     RETURNING *`,
    [jobId, userId]
  );

  if (result.rows.length === 0) {
    throw { status: 409, message: 'Already applied to this job' };
  }

  await redis.del('stats:summary');
  return result.rows[0]!;
}

export async function getMyApplications(userId: string) {
  const result = await query<ApplicationWithJob>(
    `SELECT a.id, a.job_id, a.status, a.applied_at, j.title, j.company
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE a.user_id=$1
     ORDER BY a.applied_at DESC`,
    [userId]
  );
  return result.rows;
}
