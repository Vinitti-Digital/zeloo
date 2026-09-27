# Mantena

Collaborative maintenance and organization PWA foundation.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod + date-fns
- Supabase (PostgreSQL, Auth, RLS, Storage-ready)
- Vercel-ready deploy

## Domain hierarchy

User → User Group → Maintenance Group → Service → Routine → Execution

## Getting started

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Fill Supabase values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Install and run:

```bash
npm install
npm run dev
```

4. Apply database migrations (local Docker or linked remote):

```bash
npx supabase db push
# or use the versioned files in supabase/migrations
```

5. Quality checks:

```bash
npm run lint
npm run typecheck
```

## Foundation status

Implemented in this stage:

- Next.js + Tailwind + shadcn/ui scaffold
- Supabase clients (browser/server/middleware)
- Versioned migrations for core domain tables
- RLS helpers and policies
- RPCs: `create_user_group`, `leave_user_group` (OWNER succession), `remove_group_member`, routine recalculation
- Auth (sign up / sign in / sign out)
- Authenticated layout
- User group create/list/detail flow (creator becomes OWNER)
- Minimal PWA manifest + icons

## Next recommended steps

1. Invitations accept/cancel UI
2. Maintenance groups CRUD
3. Services + one-off execution creation
4. Routines + first-occurrence preview
5. Execution complete/reschedule/cancel flows
6. Activity log views
7. Service worker / offline cache (later)
