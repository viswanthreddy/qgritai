begin;
select plan(4);

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

select ok((select relrowsecurity from pg_class where oid = 'public.organization_members'::regclass), 'RLS is active for memberships');
select ok((select relrowsecurity from pg_class where oid = 'public.engagements'::regclass), 'RLS is active for engagements');

set local role authenticated;
set local "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select is((select count(*) from public.organizations), 1::bigint, 'a member sees exactly their own organization');
select is((select count(*) from public.organizations where id = 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb'), 0::bigint, 'a member cannot read another tenant');

select * from finish();
rollback;
