import { query } from '../../db/postgres';
import { redis } from '../../db/redis';
import { JobDetail } from '../../models/mongo/jobDetail.model';

interface JobRow {
  id: string;
  employer_id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  created_at: Date;
}

export async function listJobs() {
  const cached = await redis.get('jobs:list');
  if (cached) return JSON.parse(cached) as JobRow[];

  const result = await query<JobRow>(
    `SELECT id, title, company, location, type, status, created_at
     FROM jobs WHERE status = 'open'
     ORDER BY created_at DESC`
  );
  await redis.set('jobs:list', JSON.stringify(result.rows), 'EX', 300);
  return result.rows;
}

export async function getJobById(id: string) {
  const cacheKey = `job:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as object;

  const [pgResult, mongoDoc] = await Promise.all([
    query<JobRow>('SELECT * FROM jobs WHERE id=$1', [id]),
    JobDetail.findById(id).lean(),
  ]);

  const job = pgResult.rows[0];
  if (!job) return null;

  const merged = { ...job, details: mongoDoc ?? null };
  await redis.set(cacheKey, JSON.stringify(merged), 'EX', 600);
  return merged;
}

export async function createJob(
  employerId: string,
  body: {
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    requirements?: string[];
    responsibilities?: string[];
    perks?: string[];
    techStack?: string[];
    companyInfo?: {
      website?: string;
      size?: string;
      industry?: string;
      logoUrl?: string;
    };
    applicationDeadline?: string;
  }
) {
  const { title, company, location, type, description, requirements, responsibilities, perks, techStack, companyInfo, applicationDeadline } = body;

  const pgResult = await query<JobRow>(
    `INSERT INTO jobs(employer_id, title, company, location, type)
     VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [employerId, title, company, location, type]
  );
  const job = pgResult.rows[0]!;

  await JobDetail.create({
    _id: job.id,
    description,
    requirements: requirements ?? [],
    responsibilities: responsibilities ?? [],
    perks: perks ?? [],
    techStack: techStack ?? [],
    companyInfo: companyInfo ?? {},
    applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
  });

  await redis.del('jobs:list');
  return job;
}
