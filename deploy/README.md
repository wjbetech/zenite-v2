Staging & deployment checklist
=============================

This document explains how to create a staging environment (Vercel preview + Render Postgres) and how to validate the deployed app can talk to the DB and Clerk.

1) Create a staging branch
   - We already have a `staging` branch in this repository. Push local changes to `staging` and Vercel will create a preview deployment for branch pushes.

2) Provision a Render Postgres for staging (recommended)
   - Sign into Render and create a new Postgres instance.
   - Name: `zenite-v2-staging` (suggested)
   - Choose a plan appropriate to your needs.
   - Once created, copy the External DATABASE_URL (it looks like `postgresql://user:pass@host:5432/dbname?sslmode=require`).

3) Configure Vercel preview environment variables
   - In Vercel project → Settings → Environment Variables add the following for "Preview" (and optionally "Development"):
     - DATABASE_URL = <staging DATABASE_URL>
     - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = <staging publishable key>
     - CLERK_SECRET_KEY = <staging secret key>
     - NEXT_PUBLIC_ENV = staging
   - Do NOT add secrets to git. Use Vercel's UI only.

4) Health endpoint (quick connectivity check)
   - We added `/api/health` to the `staging` branch. After the preview deploy completes, visit:
     - https://<your-vercel-preview-url>/api/health
   - Expected: { status: 'ok' } (HTTP 200). If it returns 500, check the Vercel logs and DB connection string.

5) Apply Prisma migrations to staging
   - Locally, set DATABASE_URL to the staging DB and run:
     ```bash
     export DATABASE_URL="<staging database url>"
     npx prisma migrate deploy
     ```
   - Alternatively, create a one-off job on Render or a CI workflow that runs migrations against the staging DB.

6) Validate basic app flows
   - Open the Vercel preview deployment for the `staging` branch.
   - Test creating a project and a task; check that the API responds and that data is persisted in the staging DB.

7) Add CI smoke check (recommended)
   - Add a GitHub Actions job that calls `/api/health` for each preview deployment; fail the job if it returns non-200.

8) Promote to production
   - After validating in staging, repeat steps in Production:
     - Add production DATABASE_URL to Vercel Production envs.
     - Add production Clerk keys to Vercel Production envs.
     - Run migrations against production only after confirmed staging behavior.

9) Secrets and rotation
   - If any production secrets accidentally landed in git history, rotate them now (Clerk keys) and remove `.env` from tracking.
   - To purge secrets from history, use BFG or git filter-repo and coordinate a force-push with collaborators.

If you'd like, I can:
 - Run the `npx prisma migrate deploy` locally for the staging DB once you provide the DATABASE_URL (you keep the secret private), or
 - Add the GitHub Actions smoke workflow and a short script to call `/api/health` automatically after a Vercel preview deploy.
