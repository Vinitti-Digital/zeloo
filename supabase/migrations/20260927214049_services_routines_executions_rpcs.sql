-- Stages 5–7: service / routine / execution RPCs
-- Also harden compute_next_occurrence and make recalculate respect is_active

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

  delete from public.service_executions
  where service_id = v_routine.service_id
    and status = 'PENDING'
    and scheduled_date >= current_date;

  if not v_routine.is_active then
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
      jsonb_build_object('created_executions', 0, 'is_active', false)
    );
    return 0;
  end if;

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

revoke all on function public.compute_next_occurrence(
  date,
  public.routine_frequency,
  integer,
  date,
  smallint[],
  smallint,
  date
) from public;
revoke all on function public.compute_next_occurrence(
  date,
  public.routine_frequency,
  integer,
  date,
  smallint[],
  smallint,
  date
) from anon;
grant execute on function public.compute_next_occurrence(
  date,
  public.routine_frequency,
  integer,
  date,
  smallint[],
  smallint,
  date
) to authenticated;

create or replace function public.create_service(
  p_maintenance_group_id uuid,
  p_title text,
  p_description text default null,
  p_priority public.service_priority default null,
  p_responsible_user_id uuid default null,
  p_location text default null,
  p_estimated_cost numeric default null,
  p_notes text default null
)
returns public.services
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_user_group_id uuid;
  v_service public.services;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select user_group_id into v_user_group_id
  from public.maintenance_groups
  where id = p_maintenance_group_id;

  if v_user_group_id is null then
    raise exception 'Maintenance group not found';
  end if;

  if not private.is_active_group_member(v_user_group_id) then
    raise exception 'Active membership required';
  end if;

  if p_title is null or char_length(trim(p_title)) = 0 then
    raise exception 'Service title is required';
  end if;

  if p_responsible_user_id is not null
     and not exists (
       select 1
       from public.user_group_members m
       where m.user_group_id = v_user_group_id
         and m.user_id = p_responsible_user_id
         and m.status = 'ACTIVE'
     )
  then
    raise exception 'Responsible user must be an active member';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  insert into public.services (
    maintenance_group_id,
    title,
    description,
    priority,
    responsible_user_id,
    location,
    estimated_cost,
    notes,
    created_by_user_id,
    updated_by_user_id
  )
  values (
    p_maintenance_group_id,
    trim(p_title),
    nullif(trim(coalesce(p_description, '')), ''),
    p_priority,
    p_responsible_user_id,
    nullif(trim(coalesce(p_location, '')), ''),
    p_estimated_cost,
    nullif(trim(coalesce(p_notes, '')), ''),
    v_user_id,
    v_user_id
  )
  returning * into v_service;

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
    'SERVICE',
    v_service.id,
    'CREATED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object('title', v_service.title)
  );

  return v_service;
end;
$$;

revoke all on function public.create_service(
  uuid, text, text, public.service_priority, uuid, text, numeric, text
) from public;
revoke all on function public.create_service(
  uuid, text, text, public.service_priority, uuid, text, numeric, text
) from anon;
grant execute on function public.create_service(
  uuid, text, text, public.service_priority, uuid, text, numeric, text
) to authenticated;

create or replace function public.update_service(
  p_service_id uuid,
  p_title text,
  p_description text default null,
  p_priority public.service_priority default null,
  p_responsible_user_id uuid default null,
  p_location text default null,
  p_estimated_cost numeric default null,
  p_notes text default null,
  p_status public.service_status default 'ACTIVE'
)
returns public.services
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_user_group_id uuid;
  v_service public.services;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_service
  from public.services
  where id = p_service_id
  for update;

  if v_service.id is null then
    raise exception 'Service not found';
  end if;

  v_user_group_id := private.user_group_id_for_service(p_service_id);

  if not private.is_active_group_member(v_user_group_id) then
    raise exception 'Active membership required';
  end if;

  if p_title is null or char_length(trim(p_title)) = 0 then
    raise exception 'Service title is required';
  end if;

  if p_responsible_user_id is not null
     and not exists (
       select 1
       from public.user_group_members m
       where m.user_group_id = v_user_group_id
         and m.user_id = p_responsible_user_id
         and m.status = 'ACTIVE'
     )
  then
    raise exception 'Responsible user must be an active member';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  update public.services
  set title = trim(p_title),
      description = nullif(trim(coalesce(p_description, '')), ''),
      priority = p_priority,
      responsible_user_id = p_responsible_user_id,
      location = nullif(trim(coalesce(p_location, '')), ''),
      estimated_cost = p_estimated_cost,
      notes = nullif(trim(coalesce(p_notes, '')), ''),
      status = p_status,
      updated_by_user_id = v_user_id,
      updated_at = now()
  where id = p_service_id
  returning * into v_service;

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
    'SERVICE',
    v_service.id,
    'UPDATED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object('title', v_service.title, 'status', v_service.status)
  );

  return v_service;
end;
$$;

revoke all on function public.update_service(
  uuid, text, text, public.service_priority, uuid, text, numeric, text, public.service_status
) from public;
revoke all on function public.update_service(
  uuid, text, text, public.service_priority, uuid, text, numeric, text, public.service_status
) from anon;
grant execute on function public.update_service(
  uuid, text, text, public.service_priority, uuid, text, numeric, text, public.service_status
) to authenticated;

create or replace function public.delete_service(p_service_id uuid)
returns public.services
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_user_group_id uuid;
  v_service public.services;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_service
  from public.services
  where id = p_service_id
  for update;

  if v_service.id is null then
    raise exception 'Service not found';
  end if;

  v_user_group_id := private.user_group_id_for_service(p_service_id);

  if not private.is_group_owner(v_user_group_id) then
    raise exception 'Only OWNER can delete services';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

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
    'SERVICE',
    v_service.id,
    'DELETED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object('title', v_service.title)
  );

  delete from public.services where id = p_service_id;

  return v_service;
end;
$$;

revoke all on function public.delete_service(uuid) from public;
revoke all on function public.delete_service(uuid) from anon;
grant execute on function public.delete_service(uuid) to authenticated;

create or replace function public.create_one_off_execution(
  p_service_id uuid,
  p_due_date date,
  p_notes text default null
)
returns public.service_executions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_user_group_id uuid;
  v_execution public.service_executions;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_due_date is null then
    raise exception 'Due date is required';
  end if;

  v_user_group_id := private.user_group_id_for_service(p_service_id);

  if v_user_group_id is null then
    raise exception 'Service not found';
  end if;

  if not private.is_active_group_member(v_user_group_id) then
    raise exception 'Active membership required';
  end if;

  if exists (
    select 1
    from public.service_executions se
    where se.service_id = p_service_id
      and se.scheduled_date = p_due_date
      and se.status = 'PENDING'
  ) then
    raise exception 'A pending execution already exists for this date';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  insert into public.service_executions (
    service_id,
    scheduled_date,
    due_date,
    status,
    notes
  )
  values (
    p_service_id,
    p_due_date,
    p_due_date,
    'PENDING',
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning * into v_execution;

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
    'EXECUTION',
    v_execution.id,
    'CREATED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object(
      'service_id', p_service_id,
      'due_date', p_due_date,
      'one_off', true
    )
  );

  return v_execution;
end;
$$;

revoke all on function public.create_one_off_execution(uuid, date, text) from public;
revoke all on function public.create_one_off_execution(uuid, date, text) from anon;
grant execute on function public.create_one_off_execution(uuid, date, text) to authenticated;

create or replace function public.create_service_routine(
  p_service_id uuid,
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
  v_user_group_id uuid;
  v_routine public.service_routines;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_user_group_id := private.user_group_id_for_service(p_service_id);

  if v_user_group_id is null then
    raise exception 'Service not found';
  end if;

  if not private.is_active_group_member(v_user_group_id) then
    raise exception 'Active membership required';
  end if;

  if exists (
    select 1 from public.service_routines where service_id = p_service_id
  ) then
    raise exception 'This service already has a routine';
  end if;

  if p_interval_value is null or p_interval_value < 1 then
    raise exception 'Interval must be >= 1';
  end if;

  if p_base_date is null then
    raise exception 'Base date is required';
  end if;

  if p_end_date is not null and p_end_date < p_base_date then
    raise exception 'End date must be on or after base date';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  insert into public.service_routines (
    service_id,
    frequency,
    interval_value,
    base_date,
    end_date,
    weekdays,
    month_day,
    is_active,
    created_by_user_id,
    updated_by_user_id
  )
  values (
    p_service_id,
    p_frequency,
    p_interval_value,
    p_base_date,
    p_end_date,
    p_weekdays,
    p_month_day,
    coalesce(p_is_active, true),
    v_user_id,
    v_user_id
  )
  returning * into v_routine;

  perform public.recalculate_future_executions(v_routine.id);

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
    'CREATED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object(
      'frequency', p_frequency,
      'interval_value', p_interval_value,
      'base_date', p_base_date
    )
  );

  return v_routine;
end;
$$;

revoke all on function public.create_service_routine(
  uuid, public.routine_frequency, integer, date, date, smallint[], smallint, boolean
) from public;
revoke all on function public.create_service_routine(
  uuid, public.routine_frequency, integer, date, date, smallint[], smallint, boolean
) from anon;
grant execute on function public.create_service_routine(
  uuid, public.routine_frequency, integer, date, date, smallint[], smallint, boolean
) to authenticated;

create or replace function public.delete_service_routine(p_routine_id uuid)
returns public.service_routines
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_user_group_id uuid;
  v_routine public.service_routines;
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

  if not private.is_group_owner(v_user_group_id) then
    raise exception 'Only OWNER can delete routines';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  delete from public.service_executions
  where service_id = v_routine.service_id
    and status = 'PENDING'
    and scheduled_date >= current_date;

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
    'DELETED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object('service_id', v_routine.service_id)
  );

  delete from public.service_routines where id = p_routine_id;

  return v_routine;
end;
$$;

revoke all on function public.delete_service_routine(uuid) from public;
revoke all on function public.delete_service_routine(uuid) from anon;
grant execute on function public.delete_service_routine(uuid) to authenticated;

create or replace function public.complete_execution(
  p_execution_id uuid,
  p_actual_cost numeric default null,
  p_notes text default null
)
returns public.service_executions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_user_group_id uuid;
  v_execution public.service_executions;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_execution
  from public.service_executions
  where id = p_execution_id
  for update;

  if v_execution.id is null then
    raise exception 'Execution not found';
  end if;

  v_user_group_id := private.user_group_id_for_execution(p_execution_id);

  if not private.is_active_group_member(v_user_group_id) then
    raise exception 'Active membership required';
  end if;

  if v_execution.status <> 'PENDING' then
    raise exception 'Only pending executions can be completed';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  update public.service_executions
  set status = 'COMPLETED',
      completed_at = now(),
      completed_by_user_id = v_user_id,
      completed_by_display_name = coalesce(v_display_name, 'Unknown user'),
      actual_cost = p_actual_cost,
      notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes),
      updated_at = now()
  where id = p_execution_id
  returning * into v_execution;

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
    'EXECUTION',
    v_execution.id,
    'COMPLETED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object(
      'service_id', v_execution.service_id,
      'due_date', v_execution.due_date
    )
  );

  return v_execution;
end;
$$;

revoke all on function public.complete_execution(uuid, numeric, text) from public;
revoke all on function public.complete_execution(uuid, numeric, text) from anon;
grant execute on function public.complete_execution(uuid, numeric, text) to authenticated;

create or replace function public.cancel_execution(
  p_execution_id uuid,
  p_reason text default null
)
returns public.service_executions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_user_group_id uuid;
  v_execution public.service_executions;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_execution
  from public.service_executions
  where id = p_execution_id
  for update;

  if v_execution.id is null then
    raise exception 'Execution not found';
  end if;

  v_user_group_id := private.user_group_id_for_execution(p_execution_id);

  if not private.is_active_group_member(v_user_group_id) then
    raise exception 'Active membership required';
  end if;

  if v_execution.status <> 'PENDING' then
    raise exception 'Only pending executions can be cancelled';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  update public.service_executions
  set status = 'CANCELLED',
      cancelled_at = now(),
      cancelled_by_user_id = v_user_id,
      cancelled_by_display_name = coalesce(v_display_name, 'Unknown user'),
      cancel_reason = nullif(trim(coalesce(p_reason, '')), ''),
      updated_at = now()
  where id = p_execution_id
  returning * into v_execution;

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
    'EXECUTION',
    v_execution.id,
    'CANCELLED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object(
      'service_id', v_execution.service_id,
      'due_date', v_execution.due_date,
      'reason', v_execution.cancel_reason
    )
  );

  return v_execution;
end;
$$;

revoke all on function public.cancel_execution(uuid, text) from public;
revoke all on function public.cancel_execution(uuid, text) from anon;
grant execute on function public.cancel_execution(uuid, text) to authenticated;

create or replace function public.reschedule_execution(
  p_execution_id uuid,
  p_new_due_date date,
  p_reason text default null
)
returns public.service_executions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_user_group_id uuid;
  v_execution public.service_executions;
  v_previous date;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_new_due_date is null then
    raise exception 'New due date is required';
  end if;

  select *
  into v_execution
  from public.service_executions
  where id = p_execution_id
  for update;

  if v_execution.id is null then
    raise exception 'Execution not found';
  end if;

  v_user_group_id := private.user_group_id_for_execution(p_execution_id);

  if not private.is_active_group_member(v_user_group_id) then
    raise exception 'Active membership required';
  end if;

  if v_execution.status <> 'PENDING' then
    raise exception 'Only pending executions can be rescheduled';
  end if;

  if p_new_due_date = v_execution.due_date then
    raise exception 'New due date must differ from the current due date';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  v_previous := v_execution.due_date;

  update public.service_executions
  set due_date = p_new_due_date,
      updated_at = now()
  where id = p_execution_id
  returning * into v_execution;

  insert into public.execution_reschedules (
    execution_id,
    previous_due_date,
    new_due_date,
    changed_by_user_id,
    changed_by_display_name,
    reason
  )
  values (
    p_execution_id,
    v_previous,
    p_new_due_date,
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    nullif(trim(coalesce(p_reason, '')), '')
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
    v_user_group_id,
    'EXECUTION',
    v_execution.id,
    'RESCHEDULED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object(
      'previous_due_date', v_previous,
      'new_due_date', p_new_due_date
    )
  );

  return v_execution;
end;
$$;

revoke all on function public.reschedule_execution(uuid, date, text) from public;
revoke all on function public.reschedule_execution(uuid, date, text) from anon;
grant execute on function public.reschedule_execution(uuid, date, text) to authenticated;
