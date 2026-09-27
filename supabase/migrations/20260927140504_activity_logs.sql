-- Activity / audit log

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_group_id uuid not null references public.user_groups (id) on delete cascade,
  entity_type public.activity_entity_type not null,
  entity_id uuid not null,
  action public.activity_action not null,
  actor_user_id uuid references public.profiles (id) on delete set null,
  actor_display_name text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_user_group_id_created_at_idx
  on public.activity_logs (user_group_id, created_at desc);

create index activity_logs_entity_idx
  on public.activity_logs (entity_type, entity_id);
