import 'dotenv/config';

function require(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  POSTGRES_URL: require('POSTGRES_URL'),
  MONGODB_URI: require('MONGODB_URI'),
  REDIS_URL: require('REDIS_URL'),
  JWT_ACCESS_SECRET: require('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: require('JWT_REFRESH_SECRET'),
  PORT: parseInt(process.env['PORT'] ?? '3000', 10),
};
