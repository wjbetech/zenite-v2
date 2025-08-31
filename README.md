Zenite-V2.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Local development: database

Run a local Postgres using Docker Compose and generate the Prisma client:

1. Copy `.env.example` to `.env.local` and edit if needed.
2. Start the DB: `npm run db:start`
3. Install deps: `npm install`
4. Generate Prisma client: `npm run prisma:generate`
5. To apply migrations during development: `npm run prisma:migrate:dev`

## Local Docker DB (detailed)

This project includes a `docker-compose.yml` to run a local PostgreSQL instance and a Prisma schema at `prisma/schema.prisma`.

Prerequisites

- Docker Desktop (Windows/macOS) or Docker Engine + docker-compose (Linux)
- Node.js and npm installed

Quick start (copy-paste)

```bash
# copy example env, edit if you want a different password/port
cp .env.example .env

# start only the DB service in detached mode
npm run db:start

# install node deps (if not already installed)
npm install

# generate Prisma client
npm run prisma:generate

# apply migrations (creates prisma/migrations and applies to DB)
npm run prisma:migrate:dev

# verify DB is running (psql or docker logs)
docker compose ps
docker compose logs --tail=50 db
```

Windows notes

- If using PowerShell, use `Copy-Item .env.example .env` or simply duplicate the file in Explorer.
- Ensure Docker Desktop is running before `npm run db:start`.

Customizing the database URL

- `.env` contains `DATABASE_URL` (defaults to `postgresql://postgres:password@localhost:5432/zenite_dev?schema=public`).
- If you change the port or password, update `.env` accordingly and re-run `prisma migrate dev`.

Verifying the DB and schema

- Use `psql` (from Postgres client) or a GUI like pgAdmin / TablePlus. Example using psql:

```bash
# connect to the database
psql "postgresql://postgres:password@localhost:5432/zenite_dev"

# list tables
\dt

# run a quick query
SELECT * FROM "Task" LIMIT 5;
```

Seeding demo data (optional)

- You can create a simple seed script that uses the generated Prisma client. Example file `prisma/seed.ts`:

```ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.create({ data: { email: 'me@example.com', name: 'Local Dev' } });
  await prisma.task.createMany({
    data: [{ title: 'Welcome task', description: 'This is a seeded task', ownerId: u.id }],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Then run (after `npm install` and generating client):

```bash
# transpile/run with ts-node or compile with tsc
npx ts-node prisma/seed.ts
```

Stopping and cleaning up

```bash
# stop and remove containers
npm run db:stop

# if you want to remove the persistent volume (data), run:
docker volume rm zenite-v2_db-data
```

Troubleshooting

- "Environment variable not found: DATABASE_URL": ensure `.env` exists in the project root and contains `DATABASE_URL`.
- Docker can't start: make sure Docker Desktop/Engine is running and has sufficient resources.
- Permission issues on Linux with volumes: check file permissions or mount options.
- Ports already in use: change the host port in `docker-compose.yml` (left side of `"5432:5432"`).

If anything fails, paste the output of `docker compose ps` and `docker compose logs --tail=200 db` and I can help debug.
