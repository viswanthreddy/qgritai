create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_events enable row level security;
grant select on public.audit_events to authenticated;
create policy "audit_events_tenant_select" on public.audit_events for select to authenticated
using (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]));

create or replace function public.capture_audit_event()
returns trigger language plpgsql security definer set search_path = '' as $$
declare row_data jsonb; previous_data jsonb; target_org uuid; target_id uuid; event_details jsonb;
begin
  row_data := to_jsonb(new);
  previous_data := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
  target_org := (row_data ->> 'organization_id')::uuid;
  target_id := coalesce((row_data ->> 'id')::uuid, (row_data ->> 'user_id')::uuid);
  event_details := jsonb_strip_nulls(jsonb_build_object(
    'name', row_data ->> 'name',
    'title', row_data ->> 'title',
    'subject', row_data ->> 'subject',
    'file_name', row_data ->> 'file_name',
    'role', row_data ->> 'role',
    'previous_role', previous_data ->> 'role',
    'status', row_data ->> 'status',
    'previous_status', previous_data ->> 'status',
    'progress', row_data ->> 'progress',
    'observed_on', row_data ->> 'observed_on'
  ));
  insert into public.audit_events (organization_id, actor_id, action, entity_type, entity_id, details)
  values (target_org, auth.uid(), lower(tg_op), tg_table_name, target_id, event_details);
  return new;
end;
$$;

create or replace function public.reject_audit_event_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'Audit events are immutable';
end;
$$;

create trigger audit_events_immutable before update or delete on public.audit_events
for each row execute procedure public.reject_audit_event_mutation();

create trigger audit_organization_members after insert or update on public.organization_members for each row execute procedure public.capture_audit_event();
create trigger audit_engagements after insert or update on public.engagements for each row execute procedure public.capture_audit_event();
create trigger audit_actions after insert or update on public.actions for each row execute procedure public.capture_audit_event();
create trigger audit_decisions after insert or update on public.decisions for each row execute procedure public.capture_audit_event();
create trigger audit_support_requests after insert or update on public.support_requests for each row execute procedure public.capture_audit_event();
create trigger audit_documents after insert on public.documents for each row execute procedure public.capture_audit_event();
create trigger audit_value_metrics after insert or update on public.value_metrics for each row execute procedure public.capture_audit_event();
create trigger audit_value_measurements after insert or update on public.value_measurements for each row execute procedure public.capture_audit_event();
create trigger audit_adoption_snapshots after insert on public.adoption_snapshots for each row execute procedure public.capture_audit_event();

create index audit_events_organization_created_idx on public.audit_events(organization_id, created_at desc);
