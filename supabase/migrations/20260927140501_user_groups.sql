-- User groups and memberships

create table public.user_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by_user_id uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint user_groups_name_not_blank check (char_length(trim(name)) > 0)
);

create index user_groups_created_by_user_id_idx
  on public.user_groups (created_by_user_id);

create trigger user_groups_set_updated_at
before update on public.user_groups
for each row
execute function public.set_updated_at();

create table public.user_group_members (
  id uuid primary key default gen_random_uuid(),
  user_group_id uuid not null references public.user_groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null,
  status public.member_status not null default 'ACTIVE',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  removed_at timestamptz,
  removed_by_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_group_members_left_requires_timestamp check (
    status <> 'LEFT' or left_at is not null
  ),
  constraint user_group_members_removed_requires_timestamp check (
    status <> 'REMOVED' or removed_at is not null
  )
);

create index user_group_members_user_id_idx
  on public.user_group_members (user_id);

create index user_group_members_group_status_idx
  on public.user_group_members (user_group_id, status);

create unique index user_group_members_one_active_owner_idx
  on public.user_group_members (user_group_id)
  where role = 'OWNER' and status = 'ACTIVE';

create unique index user_group_members_one_active_membership_idx
  on public.user_group_members (user_group_id, user_id)
  where status = 'ACTIVE';

create trigger user_group_members_set_updated_at
before update on public.user_group_members
for each row
execute function public.set_updated_at();
