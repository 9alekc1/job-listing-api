import express from 'express';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import applicationsRoutes from './modules/applications/applications.routes';
import statsRoutes from './modules/stats/stats.routes';

const app = express();

app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/auth', authRoutes);
app.use('/jobs', jobsRoutes);
app.use('/applications', applicationsRoutes);
app.use('/stats', statsRoutes);

app.use(errorHandler);

export default app;
