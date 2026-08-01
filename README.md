# QgritAI

QgritAI is a founder-led, agent-powered AI transformation company. This repository contains its public services website, interactive opportunity tools, lead workflow, and retained internal product foundations.

## Included

- Next.js 15 and React 19 application.
- TypeScript strict mode.
- pnpm workspace structure.
- Shared UI package.
- Service-led marketing website covering services, industries, representative work, insights, tools, and the company operating model.
- Interactive AI Readiness Assessment.
- Interactive ROI Studio.
- Contact and assessment lead capture.
- Retained authenticated workspace and internal consulting workflow foundations, excluded from the public navigation.
- Product, architecture, and roadmap documentation.
- GitHub Actions CI configuration.
- Production deployment runbook and health endpoint.

## Run locally

Requirements: Node.js 20+ and pnpm 9.15.0 (the version pinned in `package.json`).

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Optional backend development

The authenticated workspace uses Supabase Auth and PostgreSQL Row Level Security. The Supabase CLI is pinned as a project dependency. Install a Docker-compatible runtime, then run:

```bash
pnpm db:start
pnpm db:reset
```

Copy the local API URL and anonymous key reported by `supabase status` into `.env.local`. The local seed creates `demo@qgritai.local` with password `QgritAI-demo-2026`; never use these development credentials outside the local stack.

Database changes live in `supabase/migrations/`, and local-only sample records live in `supabase/seed.sql`.

Run database policy tests with `pnpm db:test` and database linting with `pnpm db:lint` while the local stack is running.

## Production deployment

The public site is deployed through Vercel and uses Supabase for validated lead capture. Follow [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the reproducible configuration. Production credentials belong in the hosting providers, never in this repository.

## Important boundary

The launch scope is the public services website, contact workflow, AI Readiness Assessment, and ROI Studio. Existing authentication, client-workspace, document, and internal CRM foundations remain in the codebase for controlled future use, but they are not presented as the current product or required for the public service journey.
