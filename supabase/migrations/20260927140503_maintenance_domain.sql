-- Maintenance groups, services, routines, executions, reschedules

create table public.maintenance_groups (
  id uuid primary key default gen_random_uuid(),
  user_group_id uuid not null references public.user_groups (id) on delete cascade,
  name text not null,
  description text,
  icon text,
  color text,
  created_by_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by_user_id uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint maintenance_groups_name_not_blank check (char_length(trim(name)) > 0)
);

create index maintenance_groups_user_group_id_idx
  on public.maintenance_groups (user_group_id);

create trigger maintenance_groups_set_updated_at
before update on public.maintenance_groups
for each row
execute function public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  maintenance_group_id uuid not null references public.maintenance_groups (id) on delete cascade,
  title text not null,
  description text,
  priority public.service_priority,
  responsible_user_id uuid references public.profiles (id) on delete set null,
  location text,
  estimated_cost numeric(12, 2),
  notes text,
  status public.service_status not null default 'ACTIVE',
  created_by_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by_user_id uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint services_title_not_blank check (char_length(trim(title)) > 0),
  constraint services_estimated_cost_non_negative check (
    estimated_cost is null or estimated_cost >= 0
  )
);

create index services_maintenance_group_id_idx
  on public.services (maintenance_group_id);

create index services_status_idx
  on public.services (status);

create index services_responsible_user_id_idx
  on public.services (responsible_user_id);

create trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

create table public.service_routines (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null unique references public.services (id) on delete cascade,
  frequency public.routine_frequency not null,
  interval_value integer not null default 1,
  base_date date not null,
  end_date date,
  weekdays smallint[],
  month_day smallint,
  is_active boolean not null default true,
  created_by_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by_user_id uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint service_routines_interval_positive check (interval_value > 0),
  constraint service_routines_end_after_base check (
    end_date is null or end_date >= base_date
  ),
  constraint service_routines_month_day_valid check (
    month_day is null or (month_day between 1 and 31)
  ),
  constraint service_routines_weekdays_valid check (
    weekdays is null
    or (
      cardinality(weekdays) > 0
      and weekdays <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
    )
  )
);

create trigger service_routines_set_updated_at
before update on public.service_routines
for each row
execute function public.set_updated_at();

create table public.service_executions (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  scheduled_date date not null,
  due_date date not null,
  status public.execution_status not null default 'PENDING',
  completed_at timestamptz,
  completed_by_user_id uuid references public.profiles (id) on delete set null,
  completed_by_display_name text,
  cancelled_at timestamptz,
  cancelled_by_user_id uuid references public.profiles (id) on delete set null,
  cancelled_by_display_name text,
  cancel_reason text,
  actual_cost numeric(12, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_executions_actual_cost_non_negative check (
    actual_cost is null or actual_cost >= 0
  ),
  constraint service_executions_completed_fields check (
    status <> 'COMPLETED'
    or (completed_at is not null and completed_by_display_name is not null)
  ),
  constraint service_executions_cancelled_fields check (
    status <> 'CANCELLED'
    or (cancelled_at is not null and cancelled_by_display_name is not null)
  )
);

create index service_executions_service_id_idx
  on public.service_executions (service_id);

create index service_executions_status_due_date_idx
  on public.service_executions (status, due_date);

create unique index service_executions_one_pending_scheduled_date_idx
  on public.service_executions (service_id, scheduled_date)
  where status = 'PENDING';

create trigger service_executions_set_updated_at
before update on public.service_executions
for each row
execute function public.set_updated_at();

create table public.execution_reschedules (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.service_executions (id) on delete cascade,
  previous_due_date date not null,
  new_due_date date not null,
  changed_by_user_id uuid references public.profiles (id) on delete set null,
  changed_by_display_name text not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint execution_reschedules_dates_differ check (
    previous_due_date <> new_due_date
  )
);

create index execution_reschedules_execution_id_idx
  on public.execution_reschedules (execution_id);
