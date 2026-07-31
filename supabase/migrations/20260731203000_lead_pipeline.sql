create type public.platform_role as enum ('user', 'consultant', 'admin');
create type public.lead_status as enum ('new', 'qualified', 'discovery', 'proposal', 'won', 'lost');

alter table public.profiles add column platform_role public.platform_role not null default 'user';

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  work_email text not null check (char_length(work_email) between 5 and 320),
  company text not null check (char_length(company) between 2 and 160),
  job_title text check (job_title is null or char_length(job_title) <= 160),
  message text not null check (char_length(message) between 20 and 3000),
  source text not null default 'contact' check (source in ('contact', 'readiness')),
  status public.lead_status not null default 'new',
  owner_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;
grant select, update on public.leads to authenticated;

create or replace function public.is_platform_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and platform_role in ('consultant', 'admin'));
$$;

create or replace function public.submit_lead(full_name text, work_email text, company text, job_title text, message text, source text default 'contact')
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if char_length(trim(full_name)) not between 2 and 120 then raise exception 'Invalid name'; end if;
  if char_length(trim(work_email)) not between 5 and 320 or position('@' in work_email) < 2 then raise exception 'Invalid email'; end if;
  if char_length(trim(company)) not between 2 and 160 then raise exception 'Invalid company'; end if;
  if char_length(trim(message)) not between 20 and 3000 then raise exception 'Invalid message'; end if;
  if source not in ('contact', 'readiness') then raise exception 'Invalid source'; end if;
  insert into public.leads (full_name, work_email, company, job_title, message, source)
  values (trim(full_name), lower(trim(work_email)), trim(company), nullif(trim(job_title), ''), trim(message), source)
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.submit_lead(text, text, text, text, text, text) from public;
grant execute on function public.submit_lead(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.is_platform_staff() to authenticated;

create policy "leads_staff_select" on public.leads for select to authenticated using (public.is_platform_staff());
create policy "leads_staff_update" on public.leads for update to authenticated
using (public.is_platform_staff()) with check (public.is_platform_staff());

create index leads_status_created_idx on public.leads(status, created_at desc);
