# Production deployment

This runbook prepares a production Supabase project and deploys `apps/web` to Vercel. It does not require or permit committing credentials.

## 1. Create the Supabase production project

1. Create a dedicated production project in the intended region.
2. Link the local repository with `pnpm exec supabase link --project-ref <project-ref>`.
3. Review pending changes with `pnpm exec supabase db push --dry-run`.
4. Apply migrations with `pnpm exec supabase db push`. Do not run `supabase/seed.sql` in production; it contains local demo credentials and records.
5. Run the database linter against the linked project and verify Row Level Security remains enabled on every tenant table.

In Supabase Auth URL Configuration, set **Site URL** to the exact production origin. Add these Redirect URLs:

- `https://<production-domain>/auth/callback`
- `http://localhost:3000/auth/callback`
- `https://*-<vercel-team-or-account-slug>.vercel.app/**` only if passwordless authentication must work on previews

Use an exact callback path for production. Keep preview wildcards scoped to the Vercel account slug.

## 2. Create the Vercel project

1. Import `viswanthreddy/qgritai` from GitHub.
2. Set the project **Root Directory** to `apps/web` and keep source files outside the root directory included so the shared `packages/ui` workspace is available.
3. Use the Next.js framework preset and pnpm detected from the repository lockfile.
4. Configure Production environment variables:

   - `NEXT_PUBLIC_SITE_URL=https://<production-domain>`
   - `NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<project-publishable-or-anon-key>`
   - `SUPABASE_SERVICE_ROLE_KEY=<server-only-project-service-role-key>`
   - `RESEND_API_KEY=<server-only-email-api-key>`
   - `EMAIL_FROM=QgritAI <notifications@<verified-domain>>`
   - `CONTACT_NOTIFICATION_TO=<internal-lead-recipient>`
   - `CRON_SECRET=<random-value-of-at-least-16-characters>`
   - `DOCUMENT_SCANNER_URL=https://<private-scanner-service>/scan`
   - `DOCUMENT_SCANNER_SECRET=<scanner-service-bearer-secret>`

5. Configure the Supabase URL and key for Preview only when previews should use a non-production Supabase environment. Never connect untrusted preview code to production customer data.

The service-role key is used only by the protected notification dispatcher. It must remain server-only and must never use a `NEXT_PUBLIC_` prefix. Verify the sending domain with the email provider before enabling delivery. The included Vercel Cron schedule runs every five minutes and therefore requires a plan that supports sub-daily Cron Jobs; otherwise replace it with an approved scheduler that calls the same protected endpoint.

## 3. Verify before traffic

- Confirm `/api/health` returns HTTP 200 with `{ "status": "ok" }`.
- Confirm `/robots.txt` references the production sitemap and disallows private, administrative, authentication, and API paths.
- Confirm `/sitemap.xml` contains only the public homepage, contact, readiness, and ROI routes under the canonical production origin.
- Trigger `/api/cron/notifications` with the configured bearer secret and verify both internal lead alerts and client proposal notices, including retry and idempotency behavior.
- Upload known-clean and standard EICAR test files in a non-production verification environment, invoke `/api/cron/document-scan`, and confirm that only the clean object is promoted from `document-quarantine` to `client-documents`. Never use live malware for verification.
- Sign up, confirm email if enabled, sign out, sign in with password, and sign in with a magic link.
- Create two organizations with separate test users and verify neither can read or change the other's data.
- Create and edit an engagement, action, decision, readiness assessment, ROI scenario, and support request.
- Check Vercel function logs and Supabase Auth/Postgres logs for unexpected errors.
- Configure the custom domain only after these checks pass, then update both `NEXT_PUBLIC_SITE_URL` and the Supabase Site URL.

## Rollback

Promote the last known-good Vercel deployment for application rollback. Database migrations must be forward-fixed with a new reviewed migration; do not rewrite or delete an applied production migration.
