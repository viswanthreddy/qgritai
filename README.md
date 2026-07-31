# QgritAI Milestone 7

This is the first consolidated, maintainable application foundation for QgritAI.

## Included

- Next.js 15 and React 19 application.
- TypeScript strict mode.
- pnpm workspace structure.
- Shared UI package.
- Premium marketing homepage.
- Interactive AI Readiness Assessment.
- Interactive ROI Studio.
- Functional browser-only client workspace.
- Product, architecture, and roadmap documentation.
- GitHub Actions CI configuration.
- Production deployment runbook and health endpoint.
- Private ClamAV document-scanner service and container definition.

## Run locally

Requirements: Node.js 20+ and pnpm 9.15.0 (the version pinned in `package.json`).

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Backend development

The authenticated workspace uses Supabase Auth and PostgreSQL Row Level Security. The Supabase CLI is pinned as a project dependency. Install a Docker-compatible runtime, then run:

```bash
pnpm db:start
pnpm db:reset
```

Copy the local API URL and anonymous key reported by `supabase status` into `.env.local`. The local seed creates `demo@qgritai.local` with password `QgritAI-demo-2026`; never use these development credentials outside the local stack.

Database changes live in `supabase/migrations/`, and local-only sample records live in `supabase/seed.sql`.

Run database policy tests with `pnpm db:test` and database linting with `pnpm db:lint` while the local stack is running.

## Production deployment

The production Supabase project, Vercel application, email domain, and `qgritai.com` custom domain are configured. Follow [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the reproducible setup and remaining scanner deployment and launch verification. Production credentials belong in the hosting providers, never in this repository.

## Important boundary

Authentication, organization onboarding, tenant isolation, persisted tools, engagement workflows, and private tenant-scoped document quarantine are implemented through Supabase. The private scanner service is implemented under `apps/scanner`, but it must be deployed and verified before accepting untrusted production documents.
