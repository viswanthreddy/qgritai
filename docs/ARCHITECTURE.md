# Architecture

## Current structure

- `apps/web`: Next.js application for the public website and product experiences.
- `packages/ui`: shared presentational components.
- `docs`: product and technical decisions.

## Backend foundation

The application uses Supabase Auth and PostgreSQL. Browser and server clients use `@supabase/ssr`, Next.js middleware refreshes sessions, and protected routes verify users with `getUser()`. Environment values are validated before client creation.

Database changes are migration-first under `supabase/migrations/`. Every tenant-owned table contains an `organization_id` and has Row Level Security enabled. Security-definer helper functions perform membership checks without recursive membership policies. Organization creation and code-based joining are exposed only as authenticated database functions.

CI runs the application quality gates separately from a disposable local Supabase stack. The database job rebuilds the schema from migrations and seed data, runs pgTAP tenant-policy tests, and applies database linting.

Production uses Vercel for the Next.js application and a dedicated Supabase project for Auth and PostgreSQL. Public deployment configuration is environment-driven. `/api/health` reports whether required public Supabase configuration is present without making a privileged request or exposing credentials.

Core future entities:

- organizations
- profiles
- engagements
- organization_members
- action_items
- decisions
- documents
- assessments
- roi_scenarios
- leads
- audit_events

## Security direction

- Tenant isolation through organization IDs and Row Level Security is the primary authorization boundary.
- Organization roles are owner, admin, consultant, and client.
- Organization membership changes run through guarded database functions. Owners cannot remove or demote the final owner, and administrators cannot promote or manage owners. Member profile visibility is limited to users who share an organization.
- Signed document URLs and malware scanning before permanent storage.
- Immutable audit events for important workspace actions.

## Platform administration

Tenant membership roles and QgritAI platform roles are separate authorization domains. Organization roles control access to customer workspaces; `profiles.platform_role` controls internal consulting and administrative surfaces. Public lead capture uses a narrowly scoped security-definer function: anonymous callers may submit validated fields, but the `leads` table grants them no direct read access. Only platform consultants and administrators can read or update the opportunity pipeline.

The service-role key must never be exposed to the browser. Public clients use only the anonymous key; elevated server operations should be introduced narrowly and audited when required.

Email delivery uses a PostgreSQL outbox. Lead and proposal transitions enqueue notification intent, and a `CRON_SECRET`-protected server route atomically claims work with the narrowly scoped server-only service role. Provider requests use stable notification IDs as idempotency keys; failures are retained with bounded exponential retry state. The current delivery adapter targets Resend through its HTTPS API, while notification rendering remains isolated from the provider call.

Client documents enter a private quarantine bucket with a 10 MB limit and explicit MIME allowlist. Object paths begin with the tenant organization UUID, and Storage RLS verifies membership for upload. Quarantined objects have no member read policy. A protected scanning worker claims metadata records atomically and sends bytes to an authenticated external malware-scanner service. Clean files are promoted to the private client bucket; rejected files remain unavailable and are removed from quarantine. Downloads require a clean metadata verdict and use signed URLs that expire after 60 seconds; public object URLs are never generated.

Support requests are tenant-owned threads. Messages inherit the request organization, validate that the parent request belongs to the same tenant, and expose sender profiles only through shared-organization profile policies. Request creators and delivery roles can manage status; all organization members can participate in the conversation.

Value reporting separates metric definitions from dated measurements, preserving baselines and targets while supporting an evidence history. Adoption snapshots record eligible users, active users, and completed workflows at a point in time. Customer members may read reporting data; owner, admin, and consultant roles may record it. Composite foreign keys prevent cross-tenant engagement or metric associations.

Important tenant mutations emit append-only audit events through database triggers. Events intentionally retain a constrained summary rather than full row contents, avoiding copies of support messages or other sensitive text. Only owner, admin, and consultant roles can read their organization audit stream; no application role receives insert, update, or delete privileges.
