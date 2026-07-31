alter table public.profiles add column email text;
update public.profiles p set email = u.email from auth.users u where u.id = p.id;
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end;
$$;

create or replace function public.shares_organization(target_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members mine
    join public.organization_members theirs on theirs.organization_id = mine.organization_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = target_user_id
  );
$$;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_shared_organization" on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.shares_organization(id));

create or replace function public.set_organization_member_role(p_organization_id uuid, p_user_id uuid, p_next_role public.organization_role)
returns void language plpgsql security definer set search_path = '' as $$
declare caller_role public.organization_role; member_role public.organization_role;
begin
  select role into caller_role from public.organization_members where organization_id = p_organization_id and user_id = auth.uid();
  select role into member_role from public.organization_members where organization_id = p_organization_id and user_id = p_user_id;
  if caller_role not in ('owner', 'admin') or member_role is null then raise exception 'Membership management denied'; end if;
  if caller_role = 'admin' and (member_role = 'owner' or p_next_role = 'owner') then raise exception 'Only owners can manage owners'; end if;
  if p_next_role <> 'owner'
    and exists (select 1 from public.organization_members m where m.organization_id = p_organization_id and m.user_id = p_user_id and m.role = 'owner')
    and not exists (select 1 from public.organization_members m where m.organization_id = p_organization_id and m.user_id <> p_user_id and m.role = 'owner') then
    raise exception 'Organization must retain an owner';
  end if;
  update public.organization_members set role = p_next_role where organization_id = p_organization_id and user_id = p_user_id;
end;
$$;

create or replace function public.remove_organization_member(p_organization_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare caller_role public.organization_role; target_role public.organization_role;
begin
  select role into caller_role from public.organization_members where organization_id = p_organization_id and user_id = auth.uid();
  select role into target_role from public.organization_members where organization_id = p_organization_id and user_id = p_user_id;
  if caller_role not in ('owner', 'admin') or target_role is null then raise exception 'Membership management denied'; end if;
  if caller_role = 'admin' and target_role = 'owner' then raise exception 'Administrators cannot remove owners'; end if;
  if target_role = 'owner'
    and not exists (select 1 from public.organization_members m where m.organization_id = p_organization_id and m.user_id <> p_user_id and m.role = 'owner') then
    raise exception 'Organization must retain an owner';
  end if;
  delete from public.organization_members where organization_id = p_organization_id and user_id = p_user_id;
end;
$$;

revoke all on function public.set_organization_member_role(uuid, uuid, public.organization_role) from public, anon;
revoke all on function public.remove_organization_member(uuid, uuid) from public, anon;
grant execute on function public.set_organization_member_role(uuid, uuid, public.organization_role) to authenticated;
grant execute on function public.remove_organization_member(uuid, uuid) to authenticated;
grant execute on function public.shares_organization(uuid) to authenticated;
