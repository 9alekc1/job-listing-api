import { env } from './config/env';
import { logger } from './config/logger';
import { connectPostgres } from './db/postgres';
import { connectMongo } from './db/mongo';
import { connectRedis } from './db/redis';
import app from './app';

async function bootstrap() {
  try {
    await connectPostgres();
    await connectMongo();
    await connectRedis();

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { err });
    process.exit(1);
  }
}

bootstrap();
