Local production run

1. Copy the template:

```bash
cp env-templates/env.production.local.example .env.production.local
```

2. Edit `.env.production.local` with your live `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

Alternatively, copy the tracked production template and create a local production file:

```bash
cp .env.prod .env.production.local
```

3. Build and start production locally:

```bash
npm run build
npm run start:prod
```

Notes

- `.env*` files are gitignored; do NOT commit `.env.production.local`.
- Next inlines `NEXT_PUBLIC_*` values at build time; ensure keys are present before running `npm run build`.
