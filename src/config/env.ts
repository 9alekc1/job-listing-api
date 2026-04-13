import 'dotenv/config';

function getRequired(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  POSTGRES_URL: getRequired('POSTGRES_URL'),
  MONGODB_URI: getRequired('MONGODB_URI'),
  REDIS_URL: getRequired('REDIS_URL'),
  JWT_ACCESS_SECRET: getRequired('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: getRequired('JWT_REFRESH_SECRET'),
  PORT: parseInt(process.env['PORT'] ?? '3000', 10),
};
