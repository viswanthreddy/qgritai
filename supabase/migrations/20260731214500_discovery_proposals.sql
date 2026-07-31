create type public.proposal_status as enum ('draft', 'sent', 'accepted', 'declined');

create table public.discovery_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  body text not null check (char_length(body) between 10 and 5000),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 160),
  summary text not null check (char_length(summary) between 20 and 5000),
  fee_amount numeric(14,2) check (fee_amount is null or fee_amount >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  status public.proposal_status not null default 'draft',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.preserve_lead_record_scope()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.lead_id := old.lead_id;
  new.created_by := old.created_by;
  return new;
end;
$$;

create trigger preserve_discovery_note_scope before update on public.discovery_notes
for each row execute procedure public.preserve_lead_record_scope();
create trigger preserve_proposal_scope before update on public.proposals
for each row execute procedure public.preserve_lead_record_scope();

create or replace function public.set_proposal_status(target_proposal_id uuid, target_lead_id uuid, next_status public.proposal_status)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_platform_staff() then raise exception 'Platform staff access required'; end if;
  update public.proposals set status = next_status, updated_at = now()
  where id = target_proposal_id and lead_id = target_lead_id;
  if not found then raise exception 'Proposal not found'; end if;
  if next_status = 'sent' then
    update public.leads set status = 'proposal', updated_at = now() where id = target_lead_id;
  elsif next_status = 'accepted' then
    update public.leads set status = 'won', updated_at = now() where id = target_lead_id;
  end if;
end;
$$;

revoke all on function public.set_proposal_status(uuid, uuid, public.proposal_status) from public, anon;
grant execute on function public.set_proposal_status(uuid, uuid, public.proposal_status) to authenticated;

alter table public.discovery_notes enable row level security;
alter table public.proposals enable row level security;
grant select, insert, update, delete on public.discovery_notes to authenticated;
grant select, insert, update, delete on public.proposals to authenticated;

create policy "discovery_notes_staff" on public.discovery_notes for all to authenticated
using (public.is_platform_staff()) with check (public.is_platform_staff() and created_by = (select auth.uid()));
create policy "proposals_staff_select" on public.proposals for select to authenticated using (public.is_platform_staff());
create policy "proposals_staff_insert" on public.proposals for insert to authenticated
with check (public.is_platform_staff() and created_by = (select auth.uid()));
create policy "proposals_staff_update" on public.proposals for update to authenticated
using (public.is_platform_staff()) with check (public.is_platform_staff());
create policy "proposals_staff_delete" on public.proposals for delete to authenticated using (public.is_platform_staff());

create index discovery_notes_lead_idx on public.discovery_notes(lead_id, created_at desc);
create index proposals_lead_idx on public.proposals(lead_id, created_at desc);
