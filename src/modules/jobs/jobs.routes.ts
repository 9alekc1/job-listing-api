import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { applyRateLimiter } from '../../middleware/rateLimiter';
import * as jobsController from './jobs.controller';
import * as applicationsController from '../applications/applications.controller';

const router = Router();

router.get('/', jobsController.listJobs);
router.get('/:id', jobsController.getJobById);
router.post('/', authMiddleware, requireRole('employer'), jobsController.createJob);
router.post('/:id/apply', authMiddleware, applyRateLimiter, applicationsController.applyToJob);

export default router;
