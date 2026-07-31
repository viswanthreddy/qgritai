create extension if not exists pgcrypto with schema extensions;

create type public.organization_role as enum ('owner', 'admin', 'consultant', 'client');
create type public.engagement_status as enum ('planned', 'active', 'on_hold', 'complete', 'cancelled');
create type public.action_status as enum ('open', 'in_progress', 'blocked', 'complete');
create type public.decision_status as enum ('proposed', 'approved', 'rejected', 'superseded');
create type public.support_status as enum ('open', 'in_progress', 'resolved', 'closed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  join_code text not null unique default upper(encode(extensions.gen_random_bytes(6), 'hex')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.organization_role not null default 'client',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  status public.engagement_status not null default 'planned',
  progress smallint not null default 0 check (progress between 0 and 100),
  starts_on date,
  ends_on date,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  name text not null default 'AI Readiness Assessment',
  total_score smallint not null check (total_score between 0 and 100),
  result_label text not null,
  created_at timestamptz not null default now()
);

create table public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  dimension text not null,
  score smallint not null check (score between 1 and 5),
  unique (assessment_id, dimension)
);

create table public.roi_scenarios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  name text not null default 'Automation opportunity',
  people integer not null check (people > 0),
  weekly_hours numeric(10,2) not null check (weekly_hours >= 0),
  hourly_cost numeric(12,2) not null check (hourly_cost >= 0),
  automation_percent numeric(5,2) not null check (automation_percent between 0 and 100),
  implementation_cost numeric(14,2) not null check (implementation_cost >= 0),
  annual_hours numeric(14,2) not null,
  annual_value numeric(16,2) not null,
  roi_percent numeric(12,2) not null,
  payback_months numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table public.actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid references public.engagements(id) on delete cascade,
  title text not null,
  owner_id uuid references public.profiles(id),
  status public.action_status not null default 'open',
  due_on date,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid references public.engagements(id) on delete cascade,
  title text not null,
  rationale text,
  status public.decision_status not null default 'proposed',
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid references public.engagements(id) on delete set null,
  subject text not null,
  description text not null,
  status public.support_status not null default 'open',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_organization_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.has_organization_role(target_organization_id uuid, allowed_roles public.organization_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
      and role = any(allowed_roles)
  );
$$;

create or replace function public.create_organization(organization_name text, organization_slug text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.organizations (name, slug, created_by)
  values (trim(organization_name), lower(trim(organization_slug)), auth.uid()) returning id into new_id;
  insert into public.organization_members (organization_id, user_id, role)
  values (new_id, auth.uid(), 'owner');
  return new_id;
end;
$$;

create or replace function public.join_organization(organization_join_code text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select id into target_id from public.organizations where join_code = upper(trim(organization_join_code));
  if target_id is null then raise exception 'Invalid organization code'; end if;
  insert into public.organization_members (organization_id, user_id, role)
  values (target_id, auth.uid(), 'client') on conflict do nothing;
  return target_id;
end;
$$;

revoke all on function public.create_organization(text, text) from public, anon;
revoke all on function public.join_organization(text) from public, anon;
grant execute on function public.create_organization(text, text) to authenticated;
grant execute on function public.join_organization(text) to authenticated;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.has_organization_role(uuid, public.organization_role[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.engagements enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.roi_scenarios enable row level security;
alter table public.actions enable row level security;
alter table public.decisions enable row level security;
alter table public.support_requests enable row level security;

grant select, update on public.profiles to authenticated;
grant select, update on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select, insert, update, delete on public.engagements to authenticated;
grant select, insert on public.assessments to authenticated;
grant select, insert on public.assessment_responses to authenticated;
grant select, insert on public.roi_scenarios to authenticated;
grant select, insert, update, delete on public.actions to authenticated;
grant select, insert, update, delete on public.decisions to authenticated;
grant select, insert, update, delete on public.support_requests to authenticated;

create policy "profiles_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "organizations_select_member" on public.organizations for select to authenticated using (public.is_organization_member(id));
create policy "organizations_update_admin" on public.organizations for update to authenticated using (public.has_organization_role(id, array['owner','admin']::public.organization_role[])) with check (public.has_organization_role(id, array['owner','admin']::public.organization_role[]));
create policy "members_select_member" on public.organization_members for select to authenticated using (public.is_organization_member(organization_id));
create policy "members_manage_admin" on public.organization_members for all to authenticated using (public.has_organization_role(organization_id, array['owner','admin']::public.organization_role[])) with check (public.has_organization_role(organization_id, array['owner','admin']::public.organization_role[]));

create policy "engagements_tenant_select" on public.engagements for select to authenticated using (public.is_organization_member(organization_id));
create policy "engagements_tenant_write" on public.engagements for all to authenticated using (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[])) with check (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]) and created_by = (select auth.uid()));

create policy "assessments_tenant_select" on public.assessments for select to authenticated using (public.is_organization_member(organization_id));
create policy "assessments_tenant_insert" on public.assessments for insert to authenticated with check (public.is_organization_member(organization_id) and created_by = (select auth.uid()));
create policy "assessment_responses_tenant_select" on public.assessment_responses for select to authenticated using (public.is_organization_member(organization_id));
create policy "assessment_responses_tenant_insert" on public.assessment_responses for insert to authenticated with check (public.is_organization_member(organization_id));
create policy "roi_tenant_select" on public.roi_scenarios for select to authenticated using (public.is_organization_member(organization_id));
create policy "roi_tenant_insert" on public.roi_scenarios for insert to authenticated with check (public.is_organization_member(organization_id) and created_by = (select auth.uid()));

create policy "actions_tenant_select" on public.actions for select to authenticated using (public.is_organization_member(organization_id));
create policy "actions_tenant_write" on public.actions for all to authenticated using (public.is_organization_member(organization_id)) with check (public.is_organization_member(organization_id) and created_by = (select auth.uid()));
create policy "decisions_tenant_select" on public.decisions for select to authenticated using (public.is_organization_member(organization_id));
create policy "decisions_tenant_write" on public.decisions for all to authenticated using (public.is_organization_member(organization_id)) with check (public.is_organization_member(organization_id) and created_by = (select auth.uid()));
create policy "support_tenant_select" on public.support_requests for select to authenticated using (public.is_organization_member(organization_id));
create policy "support_tenant_write" on public.support_requests for all to authenticated using (public.is_organization_member(organization_id)) with check (public.is_organization_member(organization_id) and created_by = (select auth.uid()));

create index organization_members_user_idx on public.organization_members(user_id);
create index engagements_organization_idx on public.engagements(organization_id);
create index assessments_organization_idx on public.assessments(organization_id);
create index roi_scenarios_organization_idx on public.roi_scenarios(organization_id);
create index actions_organization_idx on public.actions(organization_id);
create index decisions_organization_idx on public.decisions(organization_id);
create index support_requests_organization_idx on public.support_requests(organization_id);
