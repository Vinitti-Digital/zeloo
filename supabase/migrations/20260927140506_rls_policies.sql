-- Enable RLS and create policies for all application tables

alter table public.profiles enable row level security;
alter table public.user_groups enable row level security;
alter table public.user_group_members enable row level security;
alter table public.invitations enable row level security;
alter table public.maintenance_groups enable row level security;
alter table public.services enable row level security;
alter table public.service_routines enable row level security;
alter table public.service_executions enable row level security;
alter table public.execution_reschedules enable row level security;
alter table public.activity_logs enable row level security;

-- profiles
create policy profiles_select_authenticated
  on public.profiles
  for select
  to authenticated
  using (true);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- user_groups
create policy user_groups_select_member
  on public.user_groups
  for select
  to authenticated
  using (private.is_active_group_member(id));

create policy user_groups_insert_authenticated
  on public.user_groups
  for insert
  to authenticated
  with check (auth.uid() is not null);

create policy user_groups_update_owner
  on public.user_groups
  for update
  to authenticated
  using (private.is_group_owner(id))
  with check (private.is_group_owner(id));

create policy user_groups_delete_owner
  on public.user_groups
  for delete
  to authenticated
  using (private.is_group_owner(id));

-- user_group_members
create policy user_group_members_select_member
  on public.user_group_members
  for select
  to authenticated
  using (private.is_active_group_member(user_group_id));

create policy user_group_members_insert_owner
  on public.user_group_members
  for insert
  to authenticated
  with check (private.is_group_owner(user_group_id));

create policy user_group_members_update_owner_or_self_leave
  on public.user_group_members
  for update
  to authenticated
  using (
    private.is_group_owner(user_group_id)
    or user_id = auth.uid()
  )
  with check (
    private.is_group_owner(user_group_id)
    or user_id = auth.uid()
  );

create policy user_group_members_delete_owner
  on public.user_group_members
  for delete
  to authenticated
  using (private.is_group_owner(user_group_id));

-- invitations
create policy invitations_select_owner_or_invitee
  on public.invitations
  for select
  to authenticated
  using (
    private.is_group_owner(user_group_id)
    or email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy invitations_insert_owner
  on public.invitations
  for insert
  to authenticated
  with check (private.is_group_owner(user_group_id));

create policy invitations_update_owner_or_invitee
  on public.invitations
  for update
  to authenticated
  using (
    private.is_group_owner(user_group_id)
    or email = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (
    private.is_group_owner(user_group_id)
    or email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy invitations_delete_owner
  on public.invitations
  for delete
  to authenticated
  using (private.is_group_owner(user_group_id));

-- maintenance_groups
create policy maintenance_groups_select_member
  on public.maintenance_groups
  for select
  to authenticated
  using (private.is_active_group_member(user_group_id));

create policy maintenance_groups_insert_member
  on public.maintenance_groups
  for insert
  to authenticated
  with check (private.is_active_group_member(user_group_id));

create policy maintenance_groups_update_member
  on public.maintenance_groups
  for update
  to authenticated
  using (private.is_active_group_member(user_group_id))
  with check (private.is_active_group_member(user_group_id));

create policy maintenance_groups_delete_owner
  on public.maintenance_groups
  for delete
  to authenticated
  using (private.is_group_owner(user_group_id));

-- services
create policy services_select_member
  on public.services
  for select
  to authenticated
  using (
    private.is_active_group_member(
      private.user_group_id_for_maintenance_group(maintenance_group_id)
    )
  );

create policy services_insert_member
  on public.services
  for insert
  to authenticated
  with check (
    private.is_active_group_member(
      private.user_group_id_for_maintenance_group(maintenance_group_id)
    )
  );

create policy services_update_member
  on public.services
  for update
  to authenticated
  using (
    private.is_active_group_member(
      private.user_group_id_for_maintenance_group(maintenance_group_id)
    )
  )
  with check (
    private.is_active_group_member(
      private.user_group_id_for_maintenance_group(maintenance_group_id)
    )
  );

create policy services_delete_owner
  on public.services
  for delete
  to authenticated
  using (
    private.is_group_owner(
      private.user_group_id_for_maintenance_group(maintenance_group_id)
    )
  );

-- service_routines
create policy service_routines_select_member
  on public.service_routines
  for select
  to authenticated
  using (
    private.is_active_group_member(private.user_group_id_for_service(service_id))
  );

create policy service_routines_insert_member
  on public.service_routines
  for insert
  to authenticated
  with check (
    private.is_active_group_member(private.user_group_id_for_service(service_id))
  );

create policy service_routines_update_member
  on public.service_routines
  for update
  to authenticated
  using (
    private.is_active_group_member(private.user_group_id_for_service(service_id))
  )
  with check (
    private.is_active_group_member(private.user_group_id_for_service(service_id))
  );

create policy service_routines_delete_owner
  on public.service_routines
  for delete
  to authenticated
  using (
    private.is_group_owner(private.user_group_id_for_service(service_id))
  );

-- service_executions
create policy service_executions_select_member
  on public.service_executions
  for select
  to authenticated
  using (
    private.is_active_group_member(private.user_group_id_for_service(service_id))
  );

create policy service_executions_insert_member
  on public.service_executions
  for insert
  to authenticated
  with check (
    private.is_active_group_member(private.user_group_id_for_service(service_id))
  );

create policy service_executions_update_member
  on public.service_executions
  for update
  to authenticated
  using (
    private.is_active_group_member(private.user_group_id_for_service(service_id))
  )
  with check (
    private.is_active_group_member(private.user_group_id_for_service(service_id))
  );

create policy service_executions_delete_owner
  on public.service_executions
  for delete
  to authenticated
  using (
    private.is_group_owner(private.user_group_id_for_service(service_id))
  );

-- execution_reschedules
create policy execution_reschedules_select_member
  on public.execution_reschedules
  for select
  to authenticated
  using (
    private.is_active_group_member(
      private.user_group_id_for_execution(execution_id)
    )
  );

create policy execution_reschedules_insert_member
  on public.execution_reschedules
  for insert
  to authenticated
  with check (
    private.is_active_group_member(
      private.user_group_id_for_execution(execution_id)
    )
  );

create policy execution_reschedules_delete_owner
  on public.execution_reschedules
  for delete
  to authenticated
  using (
    private.is_group_owner(private.user_group_id_for_execution(execution_id))
  );

-- activity_logs
create policy activity_logs_select_member
  on public.activity_logs
  for select
  to authenticated
  using (private.is_active_group_member(user_group_id));

create policy activity_logs_insert_member
  on public.activity_logs
  for insert
  to authenticated
  with check (private.is_active_group_member(user_group_id));

create policy activity_logs_delete_owner
  on public.activity_logs
  for delete
  to authenticated
  using (private.is_group_owner(user_group_id));
