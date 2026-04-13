import { Request, Response, NextFunction } from 'express';
import * as applicationsService from './applications.service';

export async function applyToJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const application = await applicationsService.applyToJob(req.user!.id, req.params['id'] as string);
    res.status(201).json({ data: application });
  } catch (err) {
    next(err);
  }
}

export async function getMyApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const applications = await applicationsService.getMyApplications(req.user!.id);
    res.json({ data: applications });
  } catch (err) {
    next(err);
  }
}
