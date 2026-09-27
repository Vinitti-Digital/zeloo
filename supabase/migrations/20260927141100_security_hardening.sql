create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

revoke all on function public.create_user_group(text, text) from public;
revoke all on function public.create_user_group(text, text) from anon;
grant execute on function public.create_user_group(text, text) to authenticated;

revoke all on function public.leave_user_group(uuid) from public;
revoke all on function public.leave_user_group(uuid) from anon;
grant execute on function public.leave_user_group(uuid) to authenticated;

revoke all on function public.remove_group_member(uuid, uuid) from public;
revoke all on function public.remove_group_member(uuid, uuid) from anon;
grant execute on function public.remove_group_member(uuid, uuid) to authenticated;

revoke all on function public.is_active_group_member(uuid) from public;
revoke all on function public.is_active_group_member(uuid) from anon;
grant execute on function public.is_active_group_member(uuid) to authenticated;

revoke all on function public.is_group_owner(uuid) from public;
revoke all on function public.is_group_owner(uuid) from anon;
grant execute on function public.is_group_owner(uuid) to authenticated;

revoke all on function public.recalculate_future_executions(uuid) from public;
revoke all on function public.recalculate_future_executions(uuid) from anon;
grant execute on function public.recalculate_future_executions(uuid) to authenticated;

revoke all on function public.update_service_routine(
  uuid,
  public.routine_frequency,
  integer,
  date,
  date,
  smallint[],
  smallint,
  boolean
) from public;
revoke all on function public.update_service_routine(
  uuid,
  public.routine_frequency,
  integer,
  date,
  date,
  smallint[],
  smallint,
  boolean
) from anon;
grant execute on function public.update_service_routine(
  uuid,
  public.routine_frequency,
  integer,
  date,
  date,
  smallint[],
  smallint,
  boolean
) to authenticated;
