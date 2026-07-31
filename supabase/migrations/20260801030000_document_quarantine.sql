create type public.document_scan_status as enum ('pending_scan', 'scanning', 'clean', 'rejected', 'scan_failed');

alter table public.documents
  add column bucket_id text not null default 'client-documents' check (bucket_id in ('document-quarantine', 'client-documents')),
  add column scan_status public.document_scan_status not null default 'clean',
  add column scan_attempts smallint not null default 0 check (scan_attempts between 0 and 10),
  add column scan_error text,
  add column scanned_at timestamptz,
  add column next_scan_at timestamptz not null default now();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('document-quarantine', 'document-quarantine', false, 10485760, array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv', 'image/png', 'image/jpeg'
]) on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "document_quarantine_tenant_upload" on storage.objects for insert to authenticated
with check (
  bucket_id = 'document-quarantine'
  and public.is_organization_member(((storage.foldername(name))[1])::uuid)
  and owner_id = (select auth.uid()::text)
);

create policy "document_quarantine_owner_or_admin_delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'document-quarantine'
  and (owner_id = (select auth.uid()::text) or public.has_organization_role(((storage.foldername(name))[1])::uuid, array['owner','admin']::public.organization_role[]))
);

create or replace function public.claim_documents_for_scan(batch_size integer default 5)
returns setof public.documents language sql security definer set search_path = '' as $$
  update public.documents
  set scan_status = 'scanning', scan_attempts = scan_attempts + 1
  where id in (
    select id from public.documents
    where bucket_id = 'document-quarantine'
      and scan_status in ('pending_scan', 'scan_failed')
      and next_scan_at <= now() and scan_attempts < 10
    order by created_at for update skip locked limit greatest(1, least(batch_size, 10))
  )
  returning *;
$$;

revoke all on function public.claim_documents_for_scan(integer) from public, anon, authenticated;
grant execute on function public.claim_documents_for_scan(integer) to service_role;
grant select, update on public.documents to service_role;
create index documents_scan_queue_idx on public.documents(scan_status, next_scan_at, created_at);
