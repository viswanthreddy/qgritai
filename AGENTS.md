# QgritAI Engineering Instructions

## Product

QgritAI is an enterprise AI consulting and SaaS platform organized around five lifecycle stages: Discover, Design, Build, Govern, and Optimize.

## Technical direction

- Next.js App Router, React, and strict TypeScript.
- Tailwind CSS as the future styling direction; preserve the current CSS until migration is intentional.
- Supabase Auth and PostgreSQL with Row Level Security.
- Vercel deployment and a pnpm workspace.
- Shared, reusable UI components.

## Engineering standards

- Never commit secrets or environment files.
- Prefer Server Components unless interactivity requires a Client Component.
- Keep business logic outside presentation components.
- Validate user input and preserve tenant isolation for all customer data.
- Add tests for important business logic.
- Run lint, typecheck, tests, and build before declaring work complete.
- Do not present placeholders as production-ready.
- Document architectural decisions in `docs/`.
- Do not replace working functionality without explaining why.

## Current priority

1. Supabase foundation and authentication.
2. Organizations and tenant membership.
3. Persisted readiness assessments and ROI scenarios.
4. Client workspace.
5. Admin and CRM foundation.
