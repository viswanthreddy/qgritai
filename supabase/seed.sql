-- Local-only credentials: demo@qgritai.local / QgritAI-demo-2026
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'demo@qgritai.local', extensions.crypt('QgritAI-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"QgritAI Demo User"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'demo@qgritai.local', '{"sub":"11111111-1111-4111-8111-111111111111","email":"demo@qgritai.local"}', 'email', now(), now(), now())
on conflict (provider_id, provider) do nothing;

insert into public.organizations (id, name, slug, join_code, created_by)
values ('22222222-2222-4222-8222-222222222222', 'QgritAI Demo Client', 'qgritai-demo-client', 'QGRIT-DEMO-2026', '11111111-1111-4111-8111-111111111111') on conflict (id) do nothing;
insert into public.organization_members (organization_id, user_id, role)
values ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'owner') on conflict do nothing;
insert into public.engagements (id, organization_id, name, description, status, progress, created_by)
values ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'Service Operations AI Pilot', 'Validate a focused service-intake workflow.', 'active', 68, '11111111-1111-4111-8111-111111111111') on conflict (id) do nothing;
insert into public.actions (organization_id, engagement_id, title, status, created_by)
values
  ('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333', 'Confirm service-intake pilot scope', 'complete', '11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333', 'Approve CRM sandbox access', 'open', '11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333', 'Review value-measurement baseline', 'in_progress', '11111111-1111-4111-8111-111111111111');
