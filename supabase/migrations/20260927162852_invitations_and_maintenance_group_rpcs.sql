-- Invitations + maintenance group RPCs, and invitee visibility of invited groups

create policy user_groups_select_invitee
  on public.user_groups
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.invitations i
      where i.user_group_id = user_groups.id
        and i.status = 'PENDING'
        and i.email = lower(coalesce(auth.jwt() ->> 'email', ''))
        and i.expires_at > now()
    )
  );

create or replace function private.expire_invitation_if_needed(p_invitation_id uuid)
returns public.invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.invitations;
begin
  select *
  into v_invitation
  from public.invitations
  where id = p_invitation_id
  for update;

  if v_invitation.id is null then
    raise exception 'Invitation not found';
  end if;

  if v_invitation.status = 'PENDING' and v_invitation.expires_at <= now() then
    update public.invitations
    set status = 'EXPIRED',
        updated_at = now()
    where id = v_invitation.id
    returning * into v_invitation;
  end if;

  return v_invitation;
end;
$$;

revoke all on function private.expire_invitation_if_needed(uuid) from public;

create or replace function public.create_invitation(
  p_user_group_id uuid,
  p_email text
)
returns public.invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_email text;
  v_invitation public.invitations;
  v_existing_member boolean;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not private.is_group_owner(p_user_group_id) then
    raise exception 'Only OWNER can invite members';
  end if;

  v_email := lower(trim(coalesce(p_email, '')));
  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'Valid email is required';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  if v_display_name is null then
    raise exception 'Profile not found';
  end if;

  if exists (
    select 1
    from auth.users u
    where u.id = v_user_id
      and lower(u.email) = v_email
  ) then
    raise exception 'You cannot invite yourself';
  end if;

  select exists (
    select 1
    from auth.users u
    join public.user_group_members m on m.user_id = u.id
    where lower(u.email) = v_email
      and m.user_group_id = p_user_group_id
      and m.status = 'ACTIVE'
  ) into v_existing_member;

  if v_existing_member then
    raise exception 'This user is already an active member';
  end if;

  if exists (
    select 1
    from public.invitations i
    where i.user_group_id = p_user_group_id
      and i.email = v_email
      and i.status = 'PENDING'
      and i.expires_at > now()
  ) then
    raise exception 'A pending invitation already exists for this email';
  end if;

  update public.invitations
  set status = 'EXPIRED',
      updated_at = now()
  where user_group_id = p_user_group_id
    and email = v_email
    and status = 'PENDING'
    and expires_at <= now();

  insert into public.invitations (
    user_group_id,
    email,
    invited_by_user_id,
    invited_by_display_name,
    status
  )
  values (
    p_user_group_id,
    v_email,
    v_user_id,
    v_display_name,
    'PENDING'
  )
  returning * into v_invitation;

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
    'INVITATION',
    v_invitation.id,
    'INVITED',
    v_user_id,
    v_display_name,
    jsonb_build_object('email', v_email)
  );

  return v_invitation;
end;
$$;

revoke all on function public.create_invitation(uuid, text) from public;
revoke all on function public.create_invitation(uuid, text) from anon;
grant execute on function public.create_invitation(uuid, text) to authenticated;

create or replace function public.accept_invitation(p_invitation_id uuid)
returns public.user_group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_display_name text;
  v_invitation public.invitations;
  v_membership public.user_group_members;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if v_email = '' then
    raise exception 'Authenticated email is required';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  if v_display_name is null then
    raise exception 'Profile not found';
  end if;

  v_invitation := private.expire_invitation_if_needed(p_invitation_id);

  if v_invitation.status = 'EXPIRED' then
    raise exception 'Invitation has expired';
  end if;

  if v_invitation.status <> 'PENDING' then
    raise exception 'Invitation is not pending';
  end if;

  if v_invitation.email <> v_email then
    raise exception 'Invitation email does not match your account';
  end if;

  if exists (
    select 1
    from public.user_group_members m
    where m.user_group_id = v_invitation.user_group_id
      and m.user_id = v_user_id
      and m.status = 'ACTIVE'
  ) then
    raise exception 'You are already an active member of this group';
  end if;

  insert into public.user_group_members (
    user_group_id,
    user_id,
    role,
    status,
    joined_at
  )
  values (
    v_invitation.user_group_id,
    v_user_id,
    'MEMBER',
    'ACTIVE',
    now()
  )
  returning * into v_membership;

  update public.invitations
  set status = 'ACCEPTED',
      accepted_at = now(),
      accepted_by_user_id = v_user_id,
      updated_at = now()
  where id = v_invitation.id;

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
    v_invitation.user_group_id,
    'INVITATION',
    v_invitation.id,
    'INVITE_ACCEPTED',
    v_user_id,
    v_display_name,
    jsonb_build_object(
      'email', v_invitation.email,
      'membership_id', v_membership.id
    )
  );

  return v_membership;
end;
$$;

revoke all on function public.accept_invitation(uuid) from public;
revoke all on function public.accept_invitation(uuid) from anon;
grant execute on function public.accept_invitation(uuid) to authenticated;

create or replace function public.cancel_invitation(p_invitation_id uuid)
returns public.invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_display_name text;
  v_invitation public.invitations;
  v_is_owner boolean;
  v_is_invitee boolean;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  v_invitation := private.expire_invitation_if_needed(p_invitation_id);

  if v_invitation.status = 'EXPIRED' then
    raise exception 'Invitation has expired';
  end if;

  if v_invitation.status <> 'PENDING' then
    raise exception 'Invitation is not pending';
  end if;

  v_is_owner := private.is_group_owner(v_invitation.user_group_id);
  v_is_invitee := v_invitation.email = v_email;

  if not v_is_owner and not v_is_invitee then
    raise exception 'Not allowed to cancel this invitation';
  end if;

  update public.invitations
  set status = 'CANCELLED',
      cancelled_at = now(),
      cancelled_by_user_id = v_user_id,
      updated_at = now()
  where id = v_invitation.id
  returning * into v_invitation;

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
    v_invitation.user_group_id,
    'INVITATION',
    v_invitation.id,
    'INVITE_CANCELLED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object(
      'email', v_invitation.email,
      'cancelled_by', case when v_is_owner then 'OWNER' else 'INVITEE' end
    )
  );

  return v_invitation;
end;
$$;

revoke all on function public.cancel_invitation(uuid) from public;
revoke all on function public.cancel_invitation(uuid) from anon;
grant execute on function public.cancel_invitation(uuid) to authenticated;

create or replace function public.create_maintenance_group(
  p_user_group_id uuid,
  p_name text,
  p_description text default null
)
returns public.maintenance_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_group public.maintenance_groups;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not private.is_active_group_member(p_user_group_id) then
    raise exception 'Active membership required';
  end if;

  if p_name is null or char_length(trim(p_name)) = 0 then
    raise exception 'Maintenance group name is required';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  insert into public.maintenance_groups (
    user_group_id,
    name,
    description,
    created_by_user_id,
    updated_by_user_id
  )
  values (
    p_user_group_id,
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    v_user_id,
    v_user_id
  )
  returning * into v_group;

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
    'MAINTENANCE_GROUP',
    v_group.id,
    'CREATED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object('name', v_group.name)
  );

  return v_group;
end;
$$;

revoke all on function public.create_maintenance_group(uuid, text, text) from public;
revoke all on function public.create_maintenance_group(uuid, text, text) from anon;
grant execute on function public.create_maintenance_group(uuid, text, text) to authenticated;

create or replace function public.update_maintenance_group(
  p_maintenance_group_id uuid,
  p_name text,
  p_description text default null
)
returns public.maintenance_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_group public.maintenance_groups;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_group
  from public.maintenance_groups
  where id = p_maintenance_group_id
  for update;

  if v_group.id is null then
    raise exception 'Maintenance group not found';
  end if;

  if not private.is_active_group_member(v_group.user_group_id) then
    raise exception 'Active membership required';
  end if;

  if p_name is null or char_length(trim(p_name)) = 0 then
    raise exception 'Maintenance group name is required';
  end if;

  select display_name into v_display_name
  from public.profiles
  where id = v_user_id;

  update public.maintenance_groups
  set name = trim(p_name),
      description = nullif(trim(coalesce(p_description, '')), ''),
      updated_by_user_id = v_user_id,
      updated_at = now()
  where id = p_maintenance_group_id
  returning * into v_group;

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
    v_group.user_group_id,
    'MAINTENANCE_GROUP',
    v_group.id,
    'UPDATED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object('name', v_group.name)
  );

  return v_group;
end;
$$;

revoke all on function public.update_maintenance_group(uuid, text, text) from public;
revoke all on function public.update_maintenance_group(uuid, text, text) from anon;
grant execute on function public.update_maintenance_group(uuid, text, text) to authenticated;

create or replace function public.delete_maintenance_group(p_maintenance_group_id uuid)
returns public.maintenance_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text;
  v_group public.maintenance_groups;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_group
  from public.maintenance_groups
  where id = p_maintenance_group_id
  for update;

  if v_group.id is null then
    raise exception 'Maintenance group not found';
  end if;

  if not private.is_group_owner(v_group.user_group_id) then
    raise exception 'Only OWNER can delete maintenance groups';
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
    v_group.user_group_id,
    'MAINTENANCE_GROUP',
    v_group.id,
    'DELETED',
    v_user_id,
    coalesce(v_display_name, 'Unknown user'),
    jsonb_build_object('name', v_group.name)
  );

  delete from public.maintenance_groups
  where id = p_maintenance_group_id;

  return v_group;
end;
$$;

revoke all on function public.delete_maintenance_group(uuid) from public;
revoke all on function public.delete_maintenance_group(uuid) from anon;
grant execute on function public.delete_maintenance_group(uuid) to authenticated;
