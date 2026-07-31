create type public.notification_status as enum ('pending', 'processing', 'sent', 'failed');

create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  recipient_email text,
  audience text not null check (audience in ('internal', 'client')),
  template text not null check (template in ('lead_created', 'proposal_sent')),
  payload jsonb not null default '{}'::jsonb,
  status public.notification_status not null default 'pending',
  attempts smallint not null default 0 check (attempts between 0 and 10),
  next_attempt_at timestamptz not null default now(),
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.notification_outbox enable row level security;
grant select on public.notification_outbox to authenticated;
grant select, update on public.notification_outbox to service_role;
create policy "notifications_staff_select" on public.notification_outbox for select to authenticated using (public.is_platform_staff());

create or replace function public.enqueue_lead_notification()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notification_outbox (audience, template, payload)
  values ('internal', 'lead_created', jsonb_build_object('lead_id', new.id, 'name', new.full_name, 'company', new.company, 'email', new.work_email, 'source', new.source));
  return new;
end;
$$;

create trigger enqueue_new_lead after insert on public.leads
for each row execute procedure public.enqueue_lead_notification();

create or replace function public.set_proposal_status(target_proposal_id uuid, target_lead_id uuid, next_status public.proposal_status)
returns void language plpgsql security definer set search_path = '' as $$
declare target_email text; proposal_title text;
begin
  if not public.is_platform_staff() then raise exception 'Platform staff access required'; end if;
  update public.proposals set status = next_status, updated_at = now()
  where id = target_proposal_id and lead_id = target_lead_id
  returning title into proposal_title;
  if not found then raise exception 'Proposal not found'; end if;
  if next_status = 'sent' then
    update public.leads set status = 'proposal', updated_at = now() where id = target_lead_id returning work_email into target_email;
    insert into public.notification_outbox (recipient_email, audience, template, payload)
    values (target_email, 'client', 'proposal_sent', jsonb_build_object('lead_id', target_lead_id, 'proposal_id', target_proposal_id, 'title', proposal_title));
  elsif next_status = 'accepted' then
    update public.leads set status = 'won', updated_at = now() where id = target_lead_id;
  end if;
end;
$$;

create or replace function public.claim_notifications(batch_size integer default 20)
returns setof public.notification_outbox language sql security definer set search_path = '' as $$
  update public.notification_outbox
  set status = 'processing', attempts = attempts + 1
  where id in (
    select id from public.notification_outbox
    where status in ('pending', 'failed') and next_attempt_at <= now() and attempts < 10
    order by created_at for update skip locked limit greatest(1, least(batch_size, 50))
  )
  returning *;
$$;

revoke all on function public.claim_notifications(integer) from public, anon, authenticated;
grant execute on function public.claim_notifications(integer) to service_role;
create index notification_outbox_dispatch_idx on public.notification_outbox(status, next_attempt_at, created_at);
