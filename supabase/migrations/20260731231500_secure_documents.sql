alter table public.engagements add constraint engagements_id_organization_unique unique (id, organization_id);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 240),
  mime_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  foreign key (engagement_id, organization_id) references public.engagements(id, organization_id) on delete set null (engagement_id)
);

alter table public.documents enable row level security;
grant select, insert on public.documents to authenticated;
create policy "documents_tenant_select" on public.documents for select to authenticated
using (public.is_organization_member(organization_id));
create policy "documents_tenant_insert" on public.documents for insert to authenticated
with check (public.is_organization_member(organization_id) and created_by = (select auth.uid()));
create index documents_organization_created_idx on public.documents(organization_id, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('client-documents', 'client-documents', false, 10485760, array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv', 'image/png', 'image/jpeg'
]) on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "client_documents_tenant_read" on storage.objects for select to authenticated
using (
  bucket_id = 'client-documents'
  and public.is_organization_member(((storage.foldername(name))[1])::uuid)
);

create policy "client_documents_tenant_upload" on storage.objects for insert to authenticated
with check (
  bucket_id = 'client-documents'
  and public.is_organization_member(((storage.foldername(name))[1])::uuid)
  and owner_id = (select auth.uid()::text)
);

create policy "client_documents_owner_or_admin_delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'client-documents'
  and (
    owner_id = (select auth.uid()::text)
    or public.has_organization_role(((storage.foldername(name))[1])::uuid, array['owner','admin']::public.organization_role[])
  )
);
