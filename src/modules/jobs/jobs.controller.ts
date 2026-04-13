import { Request, Response, NextFunction } from 'express';
import * as jobsService from './jobs.service';

export async function listJobs(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jobs = await jobsService.listJobs();
    res.json({ data: jobs });
  } catch (err) {
    next(err);
  }
}

export async function getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const job = await jobsService.getJobById(req.params['id'] as string);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json({ data: job });
  } catch (err) {
    next(err);
  }
}

export async function createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const job = await jobsService.createJob(req.user!.id, req.body);
    res.status(201).json({ data: job });
  } catch (err) {
    next(err);
  }
}
