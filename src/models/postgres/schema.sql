CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('seeker', 'employer');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'seeker',
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  company     TEXT NOT NULL,
  location    TEXT NOT NULL,
  type        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_jobs_status     ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

CREATE TABLE applications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, user_id)
);

CREATE INDEX idx_applications_user_id ON applications(user_id);
