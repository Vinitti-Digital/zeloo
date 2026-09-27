-- Protect one-off executions from routine recalculation wipe

alter table public.service_executions
  add column if not exists is_one_off boolean not null default false;

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
    notes,
    is_one_off
  )
  values (
    p_service_id,
    p_due_date,
    p_due_date,
    'PENDING',
    nullif(trim(coalesce(p_notes, '')), ''),
    true
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
    and scheduled_date >= current_date
    and coalesce(is_one_off, false) = false;

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
        status,
        is_one_off
      )
      values (
        v_routine.service_id,
        v_next_date,
        v_next_date,
        'PENDING',
        false
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
