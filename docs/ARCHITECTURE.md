# Architecture

## Current structure

- `apps/web`: Next.js application for the public website and product experiences.
- `packages/ui`: shared presentational components.
- `docs`: product and technical decisions.

## Backend foundation

The application uses Supabase Auth and PostgreSQL. Browser and server clients use `@supabase/ssr`, Next.js middleware refreshes sessions, and protected routes verify users with `getUser()`. Environment values are validated before client creation.

Database changes are migration-first under `supabase/migrations/`. Every tenant-owned table contains an `organization_id` and has Row Level Security enabled. Security-definer helper functions perform membership checks without recursive membership policies. Organization creation and code-based joining are exposed only as authenticated database functions.

CI runs the application quality gates separately from a disposable local Supabase stack. The database job rebuilds the schema from migrations and seed data, runs pgTAP tenant-policy tests, and applies database linting.

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
- Signed document URLs and malware scanning before permanent storage.
- Immutable audit events for important workspace actions.

The service-role key must never be exposed to the browser. Public clients use only the anonymous key; elevated server operations should be introduced narrowly and audited when required.
