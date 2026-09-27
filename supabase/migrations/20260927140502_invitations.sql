-- Invitations to join a user group

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  user_group_id uuid not null references public.user_groups (id) on delete cascade,
  email text not null,
  invited_by_user_id uuid references public.profiles (id) on delete set null,
  invited_by_display_name text not null,
  status public.invitation_status not null default 'PENDING',
  token uuid not null default gen_random_uuid(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by_user_id uuid references public.profiles (id) on delete set null,
  cancelled_at timestamptz,
  cancelled_by_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitations_email_not_blank check (char_length(trim(email)) > 0),
  constraint invitations_email_lowercase check (email = lower(email))
);

create unique index invitations_token_idx on public.invitations (token);

create unique index invitations_one_pending_email_per_group_idx
  on public.invitations (user_group_id, email)
  where status = 'PENDING';

create index invitations_email_status_idx
  on public.invitations (email, status);

create trigger invitations_set_updated_at
before update on public.invitations
for each row
execute function public.set_updated_at();
