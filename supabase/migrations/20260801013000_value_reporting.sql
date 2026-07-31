create type public.metric_category as enum ('financial', 'efficiency', 'quality', 'risk', 'adoption');

create table public.value_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid,
  name text not null check (char_length(name) between 3 and 160),
  category public.metric_category not null,
  unit text not null check (char_length(unit) between 1 and 40),
  baseline_value numeric(18,4) not null,
  target_value numeric(18,4) not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  foreign key (engagement_id, organization_id) references public.engagements(id, organization_id) on delete set null (engagement_id),
  unique (id, organization_id)
);

create table public.value_measurements (
  id uuid primary key default gen_random_uuid(),
  metric_id uuid not null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  value numeric(18,4) not null,
  observed_on date not null default current_date,
  note text check (note is null or char_length(note) <= 1000),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  foreign key (metric_id, organization_id) references public.value_metrics(id, organization_id) on delete cascade,
  unique (metric_id, observed_on)
);

create table public.adoption_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid,
  observed_on date not null default current_date,
  eligible_users integer not null check (eligible_users > 0),
  active_users integer not null check (active_users between 0 and eligible_users),
  workflows_completed integer not null default 0 check (workflows_completed >= 0),
  note text check (note is null or char_length(note) <= 1000),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  foreign key (engagement_id, organization_id) references public.engagements(id, organization_id) on delete set null (engagement_id)
);

alter table public.value_metrics enable row level security;
alter table public.value_measurements enable row level security;
alter table public.adoption_snapshots enable row level security;
grant select, insert, update, delete on public.value_metrics, public.value_measurements, public.adoption_snapshots to authenticated;

create policy "value_metrics_select" on public.value_metrics for select to authenticated using (public.is_organization_member(organization_id));
create policy "value_metrics_write" on public.value_metrics for all to authenticated
using (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]))
with check (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]) and created_by = (select auth.uid()));
create policy "value_measurements_select" on public.value_measurements for select to authenticated using (public.is_organization_member(organization_id));
create policy "value_measurements_write" on public.value_measurements for all to authenticated
using (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]))
with check (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]) and created_by = (select auth.uid()));
create policy "adoption_snapshots_select" on public.adoption_snapshots for select to authenticated using (public.is_organization_member(organization_id));
create policy "adoption_snapshots_write" on public.adoption_snapshots for all to authenticated
using (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]))
with check (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]) and created_by = (select auth.uid()));

create index value_metrics_organization_idx on public.value_metrics(organization_id, created_at desc);
create index value_measurements_metric_idx on public.value_measurements(metric_id, observed_on desc);
create index adoption_snapshots_organization_idx on public.adoption_snapshots(organization_id, observed_on desc);
