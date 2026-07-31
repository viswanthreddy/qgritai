drop policy if exists "engagements_tenant_write" on public.engagements;

create or replace function public.preserve_record_tenant_and_creator()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.organization_id := old.organization_id;
  new.created_by := old.created_by;
  return new;
end;
$$;

create trigger preserve_engagement_scope before update on public.engagements
for each row execute procedure public.preserve_record_tenant_and_creator();
create trigger preserve_action_scope before update on public.actions
for each row execute procedure public.preserve_record_tenant_and_creator();
create trigger preserve_decision_scope before update on public.decisions
for each row execute procedure public.preserve_record_tenant_and_creator();

create policy "engagements_tenant_insert" on public.engagements for insert to authenticated
with check (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]) and created_by = (select auth.uid()));

create policy "engagements_tenant_update" on public.engagements for update to authenticated
using (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]))
with check (public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]));

create policy "engagements_tenant_delete" on public.engagements for delete to authenticated
using (public.has_organization_role(organization_id, array['owner','admin']::public.organization_role[]));

drop policy if exists "actions_tenant_write" on public.actions;
create policy "actions_tenant_insert" on public.actions for insert to authenticated
with check (public.is_organization_member(organization_id) and created_by = (select auth.uid()));
create policy "actions_tenant_update" on public.actions for update to authenticated
using (created_by = (select auth.uid()) or public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]))
with check (public.is_organization_member(organization_id));
create policy "actions_tenant_delete" on public.actions for delete to authenticated
using (created_by = (select auth.uid()) or public.has_organization_role(organization_id, array['owner','admin']::public.organization_role[]));

drop policy if exists "decisions_tenant_write" on public.decisions;
create policy "decisions_tenant_insert" on public.decisions for insert to authenticated
with check (public.is_organization_member(organization_id) and created_by = (select auth.uid()));
create policy "decisions_tenant_update" on public.decisions for update to authenticated
using (created_by = (select auth.uid()) or public.has_organization_role(organization_id, array['owner','admin','consultant']::public.organization_role[]))
with check (public.is_organization_member(organization_id));
create policy "decisions_tenant_delete" on public.decisions for delete to authenticated
using (created_by = (select auth.uid()) or public.has_organization_role(organization_id, array['owner','admin']::public.organization_role[]));
