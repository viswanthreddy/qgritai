begin;
select plan(39);

insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tenant-a@example.test', '{}', '{}'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tenant-b@example.test', '{}', '{}');

insert into public.organizations (id, name, slug, created_by)
values
  ('aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'Tenant A', 'tenant-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb', 'Tenant B', 'tenant-b', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.organization_members (organization_id, user_id, role)
values
  ('aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner'),
  ('bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'owner');
insert into public.documents (organization_id, storage_path, file_name, mime_type, size_bytes, created_by)
values
  ('aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa/a/test.pdf', 'test-a.pdf', 'application/pdf', 100, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb', 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb/b/test.pdf', 'test-b.pdf', 'application/pdf', 100, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.support_requests (id, organization_id, subject, description, created_by)
values
  ('aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa', 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'Tenant A support', 'Tenant A support request details.', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-4444-4444-8444-bbbbbbbbbbbb', 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb', 'Tenant B support', 'Tenant B support request details.', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.support_messages (support_request_id, organization_id, body, created_by)
values
  ('aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa', 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'Tenant A reply', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-4444-4444-8444-bbbbbbbbbbbb', 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb', 'Tenant B reply', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.value_metrics (id, organization_id, name, category, unit, baseline_value, target_value, created_by)
values
  ('aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa', 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'Tenant A cycle time', 'efficiency', 'hours', 10, 5, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-6666-4666-8666-bbbbbbbbbbbb', 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb', 'Tenant B cycle time', 'efficiency', 'hours', 12, 6, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.value_measurements (metric_id, organization_id, value, observed_on, created_by)
values
  ('aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa', 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 8, '2026-07-31', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-6666-4666-8666-bbbbbbbbbbbb', 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb', 10, '2026-07-31', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.adoption_snapshots (organization_id, observed_on, eligible_users, active_users, created_by)
values
  ('aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', '2026-07-31', 50, 40, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb', '2026-07-31', 50, 25, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

select ok((select relrowsecurity from pg_class where oid = 'public.organization_members'::regclass), 'RLS is active for memberships');
select ok((select relrowsecurity from pg_class where oid = 'public.engagements'::regclass), 'RLS is active for engagements');
select ok((select relrowsecurity from pg_class where oid = 'public.discovery_notes'::regclass), 'RLS is active for discovery notes');
select ok((select relrowsecurity from pg_class where oid = 'public.proposals'::regclass), 'RLS is active for proposals');
select ok((select relrowsecurity from pg_class where oid = 'public.notification_outbox'::regclass), 'RLS is active for notification outbox');
select ok((select relrowsecurity from pg_class where oid = 'public.documents'::regclass), 'RLS is active for document metadata');
select ok((select relrowsecurity from pg_class where oid = 'public.support_messages'::regclass), 'RLS is active for support messages');
select ok((select relrowsecurity from pg_class where oid = 'public.value_metrics'::regclass), 'RLS is active for value metrics');
select ok((select relrowsecurity from pg_class where oid = 'public.value_measurements'::regclass), 'RLS is active for value measurements');
select ok((select relrowsecurity from pg_class where oid = 'public.adoption_snapshots'::regclass), 'RLS is active for adoption snapshots');
select ok((select relrowsecurity from pg_class where oid = 'public.audit_events'::regclass), 'RLS is active for audit events');
select is((select public from storage.buckets where id = 'client-documents'), false, 'client document bucket is private');
select is((select public from storage.buckets where id = 'document-quarantine'), false, 'document quarantine bucket is private');
select is((select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'document_quarantine%' and cmd = 'SELECT'), 0::bigint, 'quarantined objects have no member read policy');
select is(has_function_privilege('authenticated', 'public.claim_documents_for_scan(integer)', 'EXECUTE'), false, 'authenticated users cannot claim scan jobs');

set local role authenticated;
set local "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select is((select count(*) from public.organizations), 1::bigint, 'a member sees exactly their own organization');
select is((select count(*) from public.organizations where id = 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb'), 0::bigint, 'a member cannot read another tenant');
select is((select count(*) from public.documents), 1::bigint, 'a member sees exactly their tenant documents');
select is((select count(*) from public.documents where organization_id = 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb'), 0::bigint, 'a member cannot read another tenant documents');
select is((select count(*) from public.documents where scan_status = 'clean'), 1::bigint, 'existing clean document metadata remains downloadable');
select is((select count(*) from public.support_messages), 1::bigint, 'a member sees exactly their tenant support messages');
select is((select count(*) from public.support_messages where organization_id = 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb'), 0::bigint, 'a member cannot read another tenant support messages');
select is((select count(*) from public.value_metrics), 1::bigint, 'a member sees exactly their tenant value metrics');
select is((select count(*) from public.adoption_snapshots), 1::bigint, 'a member sees exactly their tenant adoption snapshots');
select ok((select count(*) from public.audit_events) > 0, 'important tenant changes generate audit events');
select is((select count(*) from public.audit_events where organization_id = 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb'), 0::bigint, 'a member cannot read another tenant audit events');

select is((select count(*) from public.leads), 0::bigint, 'a regular tenant user cannot read platform leads');
select is((select count(*) from public.notification_outbox), 0::bigint, 'a regular tenant user cannot read notifications');

reset role;
select throws_ok(
  $$update public.audit_events set action = 'tampered' where id = (select min(id) from public.audit_events)$$,
  'P0001', 'Audit events are immutable', 'audit events cannot be mutated'
);
select is(has_column_privilege('authenticated', 'public.profiles', 'platform_role', 'UPDATE'), false, 'users cannot promote their own platform role');
insert into public.organization_members (organization_id, user_id, role)
values ('aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'client');

set local role authenticated;
set local "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select is((select count(*) from public.profiles where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'), 1::bigint, 'members can see profiles in a shared organization');
select lives_ok(
  $$select public.set_organization_member_role('aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'consultant')$$,
  'an owner can update a member role'
);
select throws_ok(
  $$select public.set_organization_member_role('aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin')$$,
  'P0001', 'Organization must retain an owner', 'the final owner cannot be demoted'
);

reset role;
insert into public.leads (full_name, work_email, company, message)
values ('Lead Test', 'lead@example.test', 'Example Company', 'A sufficiently detailed opportunity request for testing.');
select is(has_table_privilege('anon', 'public.leads', 'SELECT'), false, 'anonymous users have no lead read privilege');
select ok(has_function_privilege('anon', 'public.submit_readiness_lead(text,text,text,text,text,integer,text)', 'EXECUTE'), 'anonymous users can execute readiness lead capture');

set local role anon;
select lives_ok(
  $$select public.submit_readiness_lead('Readiness Lead', 'readiness@example.test', 'Example Company', 'COO', 'We need a practical plan for improving our readiness score.', 63, 'Pilot-ready')$$,
  'anonymous readiness lead submission succeeds'
);

reset role;
update public.profiles set platform_role = 'consultant' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

set local role authenticated;
set local "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select is((select count(*) from public.leads), 3::bigint, 'platform staff can read captured leads');
select is((select count(*) from public.notification_outbox), 3::bigint, 'lead capture enqueues staff-visible notifications');
select lives_ok(
  $$insert into public.discovery_notes (lead_id, body, created_by) select id, 'Discovery evidence recorded by platform staff.', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' from public.leads limit 1$$,
  'platform staff can create discovery notes'
);

select * from finish();
rollback;
