alter table public.support_requests drop constraint if exists support_requests_engagement_id_fkey;
alter table public.support_requests add constraint support_requests_engagement_tenant_fkey
foreign key (engagement_id, organization_id) references public.engagements(id, organization_id) on delete set null (engagement_id);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  support_request_id uuid not null references public.support_requests(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 5000),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create or replace function public.preserve_support_message_scope()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.support_request_id := old.support_request_id;
  new.organization_id := old.organization_id;
  new.created_by := old.created_by;
  return new;
end;
$$;

create trigger preserve_support_message_scope before update on public.support_messages
for each row execute procedure public.preserve_support_message_scope();

create or replace function public.touch_support_request()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.support_requests set updated_at = now() where id = new.support_request_id and organization_id = new.organization_id;
  return new;
end;
$$;

create trigger touch_request_after_message after insert on public.support_messages
for each row execute procedure public.touch_support_request();

alter table public.support_messages enable row level security;
grant select, insert on public.support_messages to authenticated;
create policy "support_messages_tenant_select" on public.support_messages for select to authenticated
using (public.is_organization_member(organization_id));
create policy "support_messages_tenant_insert" on public.support_messages for insert to authenticated
with check (
  public.is_organization_member(organization_id)
  and created_by = (select auth.uid())
  and exists (select 1 from public.support_requests r where r.id = support_request_id and r.organization_id = organization_id)
);

drop policy if exists "support_tenant_write" on public.support_requests;
create policy "support_tenant_insert" on public.support_requests for insert to authenticated
with check (public.is_organization_member(organization_id) and created_by = (select auth.uid()));
create policy "support_tenant_update" on public.support_requests for update to authenticated
using (created_by = (select auth.uid()) or public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]))
with check (public.is_organization_member(organization_id));
create policy "support_tenant_delete" on public.support_requests for delete to authenticated
using (created_by = (select auth.uid()) or public.has_organization_role(organization_id, array['owner','admin']::public.organization_role[]));

create index support_messages_request_created_idx on public.support_messages(support_request_id, created_at);
