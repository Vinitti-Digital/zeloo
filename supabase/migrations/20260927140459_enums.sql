-- Domain enums for collaborative maintenance management

create type public.member_role as enum ('OWNER', 'MEMBER');

create type public.member_status as enum ('ACTIVE', 'LEFT', 'REMOVED');

create type public.invitation_status as enum (
  'PENDING',
  'ACCEPTED',
  'CANCELLED',
  'EXPIRED'
);

create type public.service_status as enum ('ACTIVE', 'COMPLETED');

create type public.service_priority as enum ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

create type public.execution_status as enum ('PENDING', 'COMPLETED', 'CANCELLED');

create type public.routine_frequency as enum (
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY'
);

create type public.activity_entity_type as enum (
  'USER_GROUP',
  'MEMBERSHIP',
  'INVITATION',
  'MAINTENANCE_GROUP',
  'SERVICE',
  'ROUTINE',
  'EXECUTION'
);

create type public.activity_action as enum (
  'CREATED',
  'UPDATED',
  'DELETED',
  'COMPLETED',
  'RESCHEDULED',
  'CANCELLED',
  'INVITED',
  'INVITE_ACCEPTED',
  'INVITE_CANCELLED',
  'INVITE_RESENT',
  'MEMBER_LEFT',
  'MEMBER_REMOVED',
  'OWNER_SUCCEEDED',
  'ROUTINE_RECALCULATED'
);
