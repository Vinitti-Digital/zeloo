import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { BrandMascot } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { MyPendingInvitations } from "@/features/invitations/my-pending-invitations";
import { CreateUserGroupForm } from "@/features/user-groups/create-user-group-form";
import { formatMemberRole } from "@/lib/i18n/labels";
import { createClient } from "@/lib/supabase/server";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase() ?? "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .maybeSingle();

  const { data: memberships } = await supabase
    .from("user_group_members")
    .select("role, user_group_id, joined_at")
    .eq("user_id", user!.id)
    .eq("status", "ACTIVE")
    .order("joined_at", { ascending: true });

  const groupIds = (memberships ?? []).map((item) => item.user_group_id);

  const [{ data: groups }, { data: pendingInvites }] = await Promise.all([
    groupIds.length > 0
      ? supabase
          .from("user_groups")
          .select("id, name, description, created_at")
          .in("id", groupIds)
      : Promise.resolve({ data: [] as const }),
    email
      ? supabase
          .from("invitations")
          .select(
            "id, user_group_id, invited_by_display_name, expires_at, status",
          )
          .eq("email", email)
          .eq("status", "PENDING")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as const }),
  ]);

  const inviteGroupIds = Array.from(
    new Set((pendingInvites ?? []).map((invite) => invite.user_group_id)),
  );

  const { data: inviteGroups } =
    inviteGroupIds.length > 0
      ? await supabase
          .from("user_groups")
          .select("id, name")
          .in("id", inviteGroupIds)
      : { data: [] };

  const inviteGroupsById = new Map(
    (inviteGroups ?? []).map((group) => [group.id, group]),
  );

  const invitationsForMe = (pendingInvites ?? [])
    .map((invite) => ({
      id: invite.id,
      user_group_id: invite.user_group_id,
      invited_by_display_name: invite.invited_by_display_name,
      expires_at: invite.expires_at,
      groupName:
        inviteGroupsById.get(invite.user_group_id)?.name ?? "Grupo convidado",
    }))
    .filter((invite) => Boolean(invite.groupName));

  const groupsById = new Map((groups ?? []).map((group) => [group.id, group]));
  const hasGroups = Boolean(memberships && memberships.length > 0);
  const firstName = profile?.display_name?.split(" ")[0] ?? "olá";

  return (
    <div className="space-y-8">
      <section className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-highlight">
            Bem-vindo(a), {firstName}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
            Seus grupos
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Escolha um espaço compartilhado para cuidar das manutenções juntos.
          </p>
        </div>
        {hasGroups ? <CreateUserGroupForm /> : null}
      </section>

      <MyPendingInvitations invitations={invitationsForMe} />

      <section className="animate-fade-up-delay space-y-3">
        {hasGroups ? (
          <div className="grid gap-3">
            {memberships!.map((membership) => {
              const group = groupsById.get(membership.user_group_id);
              if (!group) {
                return null;
              }

              const initial = group.name.trim().charAt(0).toUpperCase() || "G";

              return (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="group flex items-center gap-4 rounded-3xl border border-border bg-white/85 p-4 shadow-[0_10px_30px_rgba(43,22,12,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_16px_36px_rgba(43,22,12,0.08)]"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1D2] font-[family-name:var(--font-display)] text-xl text-primary">
                    {initial}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-lg font-semibold text-foreground">
                        {group.name}
                      </span>
                      <Badge
                        variant={
                          membership.role === "OWNER" ? "default" : "secondary"
                        }
                      >
                        {formatMemberRole(membership.role)}
                      </Badge>
                    </span>
                    <span className="mt-1 block truncate text-sm text-muted-foreground">
                      {group.description || "Sem descrição"}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-primary/25 bg-white/70 px-5 py-10 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <BrandMascot width={112} />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
              Crie seu primeiro grupo
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Um grupo reúne as pessoas da casa ou do escritório para organizar
              tarefas e pendências no mesmo lugar.
            </p>
            <div className="mx-auto mt-6 max-w-md text-left">
              <CreateUserGroupForm defaultOpen />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
