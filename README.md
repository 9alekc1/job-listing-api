# job-listing-api
A simple job-listing api, based on PostgreSQL, Mongo and Redis

PostgreSQL — core relational data:

users (employers and job seekers)
job listings
applications (user applied to job)

MongoDB — flexible document data:

job listing "details" page — rich description, requirements, perks, company info (varies wildly between listings, perfect for documents)

Redis — fast ephemeral data:

cache popular job listings (avoid hitting Postgres on every request)
rate limiting (max 10 applications per user per day)
track currently online users / active sessions


The endpoints:
Auth
  POST /auth/register
  POST /auth/login
  POST /auth/refresh
  POST /auth/logout

Jobs
  GET  /jobs           → list jobs (served from Redis cache)
  GET  /jobs/:id       → job summary from Postgres + details from Mongo
  POST /jobs           → create job (employer only)

Applications
  POST /jobs/:id/apply → apply to job (rate limited via Redis)
  GET  /applications   → my applications

Stats (bonus)
  GET  /stats          → total jobs, applications today — cached in Redis