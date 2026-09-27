-- Authorization helpers for RLS (security definer, locked search_path)

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;
grant usage on schema private to service_role;

create or replace function private.current_profile_display_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.display_name
      from public.profiles p
      where p.id = auth.uid()
    ),
    'Unknown user'
  );
$$;

revoke all on function private.current_profile_display_name() from public;
grant execute on function private.current_profile_display_name() to authenticated;

create or replace function private.is_active_group_member(p_user_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_group_members ugm
    where ugm.user_group_id = p_user_group_id
      and ugm.user_id = auth.uid()
      and ugm.status = 'ACTIVE'
  );
$$;

revoke all on function private.is_active_group_member(uuid) from public;
grant execute on function private.is_active_group_member(uuid) to authenticated;

create or replace function private.is_group_owner(p_user_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_group_members ugm
    where ugm.user_group_id = p_user_group_id
      and ugm.user_id = auth.uid()
      and ugm.status = 'ACTIVE'
      and ugm.role = 'OWNER'
  );
$$;

revoke all on function private.is_group_owner(uuid) from public;
grant execute on function private.is_group_owner(uuid) to authenticated;

create or replace function private.user_group_id_for_maintenance_group(
  p_maintenance_group_id uuid
)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select mg.user_group_id
  from public.maintenance_groups mg
  where mg.id = p_maintenance_group_id;
$$;

revoke all on function private.user_group_id_for_maintenance_group(uuid) from public;
grant execute on function private.user_group_id_for_maintenance_group(uuid) to authenticated;

create or replace function private.user_group_id_for_service(p_service_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select mg.user_group_id
  from public.services s
  join public.maintenance_groups mg on mg.id = s.maintenance_group_id
  where s.id = p_service_id;
$$;

revoke all on function private.user_group_id_for_service(uuid) from public;
grant execute on function private.user_group_id_for_service(uuid) to authenticated;

create or replace function private.user_group_id_for_execution(p_execution_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select mg.user_group_id
  from public.service_executions se
  join public.services s on s.id = se.service_id
  join public.maintenance_groups mg on mg.id = s.maintenance_group_id
  where se.id = p_execution_id;
$$;

revoke all on function private.user_group_id_for_execution(uuid) from public;
grant execute on function private.user_group_id_for_execution(uuid) to authenticated;

-- Convenience wrappers in public for app/RPC usage (not for policies duplication)
create or replace function public.is_active_group_member(p_user_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.is_active_group_member(p_user_group_id);
$$;

revoke all on function public.is_active_group_member(uuid) from public;
grant execute on function public.is_active_group_member(uuid) to authenticated;

create or replace function public.is_group_owner(p_user_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.is_group_owner(p_user_group_id);
$$;

revoke all on function public.is_group_owner(uuid) from public;
grant execute on function public.is_group_owner(uuid) to authenticated;
