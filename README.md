# Pre‑Verified Virtual Assistant Marketplace

Monorepo:
- `apps/web`: Next.js dashboard (Client / VA / Admin)
- `apps/api`: Express API
- `packages/db`: Prisma + Postgres schema

## Quick start (Windows / PowerShell)

1) Create env files

- Copy `.env.example` → `.env`
- Copy `apps/api/.env.example` → `apps/api/.env`
- Copy `apps/web/.env.example` → `apps/web/.env.local`

2) Start Postgres

Option A (recommended): Docker Desktop

```powershell
cd C:\Users\HP\va-marketplace
docker compose up -d
```

Option B: Local PostgreSQL installation

- Create a database named `va_marketplace`
- Create a user `va_user` with password `va_pass` (or update `DATABASE_URL` accordingly)
- Ensure Postgres is listening on `localhost:5432`

3) Install dependencies

```powershell
npm install
npm run install:all
```

4) Sync DB schema + generate Prisma client (+ seed admin)

```powershell
npm run db:migrate
npm run db:generate
npm --prefix packages/db exec prisma db seed
```

Or run everything in one shot:

```powershell
npm run setup
```

If Prisma client generation fails on Windows with an EPERM rename error, run:

```powershell
npm run setup:clean
```

5) Start the app

```powershell
npm run dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:4000/health`

## Admin login

Admin user is seeded from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`.

## AI features (optional)

There is an optional “Generate with AI” button for job posts.

In `apps/api/.env` set:

- `AI_ENABLED=true`
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-5.2` (default)

## Deployment (recommended)

**Web (Next.js)**: deploy `apps/web` on Vercel

- Root directory: `apps/web`
- Env: `NEXT_PUBLIC_API_BASE_URL` = your API URL (example: `https://api.yourdomain.com`)

**API (Express)**: deploy `apps/api` as a Docker container (Render / Fly.io / Railway)

- Build from: `apps/api/Dockerfile`
- Set env vars:
  - `API_PORT=4000` (or the platform port env)
  - `WEB_ORIGIN` = your web URL (example: `https://yourapp.vercel.app`)
  - `DATABASE_URL` = managed Postgres connection string
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (strong random)
  - `AI_ENABLED`, `OPENAI_API_KEY` (optional)

**Database (Postgres)**: use a managed provider (Neon / Supabase / Render Postgres).
