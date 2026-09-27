-- Domain RPCs: group lifecycle, owner succession, routine recalculation

create or replace function public.create_user_group(
  p_name text,
  p_description text default null
)
returns public.user_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_group public.user_groups;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_name is null or char_length(trim(p_name)) = 0 then
    raise exception 'Group name is required';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  if v_display_name is null then
    raise exception 'Profile not found';
  end if;

  insert into public.user_groups (
    name,
    description,
    created_by_user_id,
    updated_by_user_id
  )
  values (
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    v_user_id,
    v_user_id
  )
  returning * into v_group;

  insert into public.user_group_members (
    user_group_id,
    user_id,
    role,
    status,
    joined_at
  )
  values (
    v_group.id,
    v_user_id,
    'OWNER',
    'ACTIVE',
    now()
  );

  insert into public.activity_logs (
    user_group_id,
    entity_type,
    entity_id,
    action,
    actor_user_id,
    actor_display_name,
    metadata
  )
  values (
    v_group.id,
    'USER_GROUP',
    v_group.id,
    'CREATED',
    v_user_id,
    v_display_name,
    jsonb_build_object('name', v_group.name)
  );

  return v_group;
end;
$$;

revoke all on function public.create_user_group(text, text) from public;
grant execute on function public.create_user_group(text, text) to authenticated;

create or replace function public.leave_user_group(p_user_group_id uuid)
returns public.user_group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_membership public.user_group_members;
  v_successor public.user_group_members;
  v_updated public.user_group_members;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  select *
  into v_membership
  from public.user_group_members
  where user_group_id = p_user_group_id
    and user_id = v_user_id
    and status = 'ACTIVE'
  for update;

  if v_membership.id is null then
    raise exception 'Active membership not found';
  end if;

  if v_membership.role = 'OWNER' then
    select *
    into v_successor
    from public.user_group_members
    where user_group_id = p_user_group_id
      and status = 'ACTIVE'
      and user_id <> v_user_id
    order by joined_at asc, id asc
    limit 1
    for update;

    if v_successor.id is null then
      raise exception
        'OWNER cannot leave without another active member. Invite someone or delete the group.';
    end if;

    update public.user_group_members
    set role = 'OWNER',
        updated_at = now()
    where id = v_successor.id;

    update public.user_group_members
    set role = 'MEMBER',
        status = 'LEFT',
        left_at = now(),
        updated_at = now()
    where id = v_membership.id
    returning * into v_updated;

    insert into public.activity_logs (
      user_group_id,
      entity_type,
      entity_id,
      action,
      actor_user_id,
      actor_display_name,
      metadata
    )
    values (
      p_user_group_id,
      'MEMBERSHIP',
      v_successor.id,
      'OWNER_SUCCEEDED',
      v_user_id,
      coalesce(v_display_name, 'Unknown user'),
      jsonb_build_object(
        'previous_owner_user_id', v_user_id,
        'new_owner_user_id', v_successor.user_id,
        'new_owner_membership_id', v_successor.id
      )
    );
  else
    update public.user_group_members
    set status = 'LEFT',
        left_at = now(),
        updated_at = now()
    where id = v_membership.id
    returning * into v_updated;
  end if;

  insert into public.activity_logs (
    user_group_id,
    entity_type,
    entity_id,
    action,
    actor_user_id,
    actor_display_name,
    metadata
  )
  values (
    p_user_group_id,
    'MEMBERSHIP',
    v_updated.id,
    'MEMBER_LEFT',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object('previous_role', v_membership.role)
  );

  return v_updated;
end;
$$;

revoke all on function public.leave_user_group(uuid) from public;
grant execute on function public.leave_user_group(uuid) to authenticated;

create or replace function public.remove_group_member(
  p_user_group_id uuid,
  p_member_user_id uuid
)
returns public.user_group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_display_name text;
  v_membership public.user_group_members;
  v_updated public.user_group_members;
begin
  if v_actor_id is null then
    raise exception 'Not authenticated';
  end if;

  if not private.is_group_owner(p_user_group_id) then
    raise exception 'Only OWNER can remove members';
  end if;

  if p_member_user_id = v_actor_id then
    raise exception 'OWNER cannot remove themselves. Use leave_user_group instead.';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_actor_id;

  select *
  into v_membership
  from public.user_group_members
  where user_group_id = p_user_group_id
    and user_id = p_member_user_id
    and status = 'ACTIVE'
  for update;

  if v_membership.id is null then
    raise exception 'Active membership not found';
  end if;

  if v_membership.role = 'OWNER' then
    raise exception 'Cannot remove the active OWNER';
  end if;

  update public.user_group_members
  set status = 'REMOVED',
      removed_at = now(),
      removed_by_user_id = v_actor_id,
      updated_at = now()
  where id = v_membership.id
  returning * into v_updated;

  insert into public.activity_logs (
    user_group_id,
    entity_type,
    entity_id,
    action,
    actor_user_id,
    actor_display_name,
    metadata
  )
  values (
    p_user_group_id,
    'MEMBERSHIP',
    v_updated.id,
    'MEMBER_REMOVED',
    v_actor_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object('removed_user_id', p_member_user_id)
  );

  return v_updated;
end;
$$;

revoke all on function public.remove_group_member(uuid, uuid) from public;
grant execute on function public.remove_group_member(uuid, uuid) to authenticated;

create or replace function public.add_interval_by_frequency(
  p_date date,
  p_frequency public.routine_frequency,
  p_interval integer
)
returns date
language sql
immutable
as $$
  select case p_frequency
    when 'DAILY' then p_date + (p_interval * interval '1 day')
    when 'WEEKLY' then p_date + (p_interval * interval '1 week')
    when 'MONTHLY' then p_date + (p_interval * interval '1 month')
    when 'YEARLY' then p_date + (p_interval * interval '1 year')
  end::date;
$$;

create or replace function public.compute_next_occurrence(
  p_base_date date,
  p_frequency public.routine_frequency,
  p_interval integer,
  p_after_date date,
  p_weekdays smallint[] default null,
  p_month_day smallint default null,
  p_end_date date default null
)
returns date
language plpgsql
immutable
as $$
declare
  v_cursor date;
  v_candidate date;
  v_guard integer := 0;
  v_weekday smallint;
begin
  if p_interval is null or p_interval < 1 then
    raise exception 'interval must be >= 1';
  end if;

  -- First occurrence is the next recurrence after base_date
  v_cursor := public.add_interval_by_frequency(p_base_date, p_frequency, p_interval);

  if p_frequency = 'WEEKLY' and p_weekdays is not null and cardinality(p_weekdays) > 0 then
    v_candidate := p_base_date + 1;
    while v_guard < 3700 loop
      v_weekday := extract(dow from v_candidate)::smallint;
      if v_weekday = any (p_weekdays)
         and v_candidate > p_after_date
         and (
           ((v_candidate - p_base_date) / 7) % p_interval = 0
           or p_interval = 1
         )
      then
        if p_end_date is not null and v_candidate > p_end_date then
          return null;
        end if;
        return v_candidate;
      end if;
      v_candidate := v_candidate + 1;
      v_guard := v_guard + 1;
    end loop;
    return null;
  end if;

  if p_frequency = 'MONTHLY' and p_month_day is not null then
    v_candidate := date_trunc('month', p_base_date)::date
      + ((p_month_day - 1) * interval '1 day');
    if v_candidate::date <= p_base_date then
      v_candidate := (
        date_trunc('month', p_base_date)::date
        + (p_interval * interval '1 month')
        + ((least(
          p_month_day,
          extract(
            day from (
              date_trunc('month', p_base_date)::date
              + (p_interval * interval '1 month')
              + interval '1 month - 1 day'
            )
          )::integer
        ) - 1) * interval '1 day')
      );
    end if;

    while v_candidate::date <= p_after_date loop
      v_candidate := (
        date_trunc('month', v_candidate)::date
        + (p_interval * interval '1 month')
        + ((least(
          p_month_day,
          extract(
            day from (
              date_trunc('month', v_candidate)::date
              + (p_interval * interval '1 month')
              + interval '1 month - 1 day'
            )
          )::integer
        ) - 1) * interval '1 day')
      );
      v_guard := v_guard + 1;
      if v_guard > 1200 then
        return null;
      end if;
    end loop;

    if p_end_date is not null and v_candidate::date > p_end_date then
      return null;
    end if;
    return v_candidate::date;
  end if;

  while v_cursor <= p_after_date loop
    v_cursor := public.add_interval_by_frequency(v_cursor, p_frequency, p_interval);
    v_guard := v_guard + 1;
    if v_guard > 1200 then
      return null;
    end if;
  end loop;

  if p_end_date is not null and v_cursor > p_end_date then
    return null;
  end if;

  return v_cursor;
end;
$$;

create or replace function public.recalculate_future_executions(p_routine_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_routine public.service_routines;
  v_user_group_id uuid;
  v_next_date date;
  v_horizon date := (current_date + interval '365 days')::date;
  v_created integer := 0;
  v_anchor date;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_routine
  from public.service_routines
  where id = p_routine_id
  for update;

  if v_routine.id is null then
    raise exception 'Routine not found';
  end if;

  v_user_group_id := private.user_group_id_for_service(v_routine.service_id);

  if not private.is_active_group_member(v_user_group_id) then
    raise exception 'Not an active group member';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  -- Past history remains immutable: keep COMPLETED / CANCELLED, remove future PENDING
  delete from public.service_executions
  where service_id = v_routine.service_id
    and status = 'PENDING'
    and scheduled_date >= current_date;

  select coalesce(max(scheduled_date), v_routine.base_date)
  into v_anchor
  from public.service_executions
  where service_id = v_routine.service_id
    and status in ('COMPLETED', 'CANCELLED');

  if v_anchor < v_routine.base_date then
    v_anchor := v_routine.base_date;
  end if;

  v_next_date := public.compute_next_occurrence(
    v_routine.base_date,
    v_routine.frequency,
    v_routine.interval_value,
    greatest(v_anchor, v_routine.base_date),
    v_routine.weekdays,
    v_routine.month_day,
    v_routine.end_date
  );

  while v_next_date is not null and v_next_date <= v_horizon loop
    if not exists (
      select 1
      from public.service_executions se
      where se.service_id = v_routine.service_id
        and se.scheduled_date = v_next_date
        and se.status = 'PENDING'
    ) then
      insert into public.service_executions (
        service_id,
        scheduled_date,
        due_date,
        status
      )
      values (
        v_routine.service_id,
        v_next_date,
        v_next_date,
        'PENDING'
      );
      v_created := v_created + 1;
    end if;

    v_next_date := public.compute_next_occurrence(
      v_routine.base_date,
      v_routine.frequency,
      v_routine.interval_value,
      v_next_date,
      v_routine.weekdays,
      v_routine.month_day,
      v_routine.end_date
    );
  end loop;

  insert into public.activity_logs (
    user_group_id,
    entity_type,
    entity_id,
    action,
    actor_user_id,
    actor_display_name,
    metadata
  )
  values (
    v_user_group_id,
    'ROUTINE',
    v_routine.id,
    'ROUTINE_RECALCULATED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object('created_executions', v_created)
  );

  return v_created;
end;
$$;

revoke all on function public.recalculate_future_executions(uuid) from public;
grant execute on function public.recalculate_future_executions(uuid) to authenticated;

create or replace function public.update_service_routine(
  p_routine_id uuid,
  p_frequency public.routine_frequency,
  p_interval_value integer,
  p_base_date date,
  p_end_date date default null,
  p_weekdays smallint[] default null,
  p_month_day smallint default null,
  p_is_active boolean default true
)
returns public.service_routines
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_routine public.service_routines;
  v_user_group_id uuid;
  v_updated public.service_routines;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_routine
  from public.service_routines
  where id = p_routine_id
  for update;

  if v_routine.id is null then
    raise exception 'Routine not found';
  end if;

  v_user_group_id := private.user_group_id_for_service(v_routine.service_id);

  if not private.is_active_group_member(v_user_group_id) then
    raise exception 'Not an active group member';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  update public.service_routines
  set frequency = p_frequency,
      interval_value = p_interval_value,
      base_date = p_base_date,
      end_date = p_end_date,
      weekdays = p_weekdays,
      month_day = p_month_day,
      is_active = p_is_active,
      updated_by_user_id = v_user_id,
      updated_at = now()
  where id = p_routine_id
  returning * into v_updated;

  perform public.recalculate_future_executions(p_routine_id);

  insert into public.activity_logs (
    user_group_id,
    entity_type,
    entity_id,
    action,
    actor_user_id,
    actor_display_name,
    metadata
  )
  values (
    v_user_group_id,
    'ROUTINE',
    p_routine_id,
    'UPDATED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object(
      'frequency', p_frequency,
      'interval_value', p_interval_value,
      'base_date', p_base_date
    )
  );

  return v_updated;
end;
$$;

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
