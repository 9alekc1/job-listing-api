import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as applicationsController from './applications.controller';

const router = Router();

// GET /applications
router.get('/', authMiddleware, applicationsController.getMyApplications);

export default router;
