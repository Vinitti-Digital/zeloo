import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ActivityLogPanel } from "@/features/activity/activity-log-panel";
import { PendenciesCalendar } from "@/features/calendar/pendencies-calendar";
import { GroupTabs } from "@/features/group-tabs/group-tabs";
import { GroupInvitationsPanel } from "@/features/invitations/group-invitations-panel";
import { MaintenanceGroupsPanel } from "@/features/maintenance-groups/maintenance-groups-panel";
import {
  activityPeriodStart,
  parseActivityEntity,
  parseActivityPeriod,
} from "@/lib/activity/filters";
import {
  parseCalendarDay,
  parseCalendarMonth,
  parseGroupTab,
} from "@/lib/group/tabs";
import { formatJoinedDate, formatMemberRole } from "@/lib/i18n/labels";
import { createClient } from "@/lib/supabase/server";

type GroupPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    tab?: string;
    entity?: string;
    period?: string;
    month?: string;
    day?: string;
  }>;
};

export default async function GroupDetailPage({
  params,
  searchParams,
}: GroupPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const activeTab = parseGroupTab(resolvedSearchParams.tab);
  const activityEntity = parseActivityEntity(resolvedSearchParams.entity);
  const activityPeriod = parseActivityPeriod(resolvedSearchParams.period);
  const periodStart = activityPeriodStart(activityPeriod);
  const calendarMonth = parseCalendarMonth(resolvedSearchParams.month);
  const selectedDay = parseCalendarDay(
    resolvedSearchParams.day,
    calendarMonth,
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: group } = await supabase
    .from("user_groups")
    .select("id, name, description, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!group) {
    notFound();
  }

  const { data: membership } = await supabase
    .from("user_group_members")
    .select("role, status")
    .eq("user_group_id", id)
    .eq("user_id", user!.id)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const isOwner = membership.role === "OWNER";

  let activityQuery = supabase
    .from("activity_logs")
    .select(
      "id, entity_type, action, actor_display_name, metadata, created_at",
    )
    .eq("user_group_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (activityEntity !== "ALL") {
    activityQuery = activityQuery.eq("entity_type", activityEntity);
  }
  if (periodStart) {
    activityQuery = activityQuery.gte("created_at", periodStart);
  }

  const [
    { data: members },
    { data: invitations },
    { data: maintenanceGroups },
    { data: activityLogs },
  ] = await Promise.all([
    supabase
      .from("user_group_members")
      .select("id, role, status, joined_at, user_id")
      .eq("user_group_id", id)
      .eq("status", "ACTIVE")
      .order("joined_at", { ascending: true }),
    isOwner
      ? supabase
          .from("invitations")
          .select(
            "id, email, invited_by_display_name, expires_at, created_at, status",
          )
          .eq("user_group_id", id)
          .eq("status", "PENDING")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
      : Promise.resolve({
          data: [] as Array<{
            id: string;
            email: string;
            invited_by_display_name: string;
            expires_at: string;
            created_at: string;
            status: "PENDING" | "ACCEPTED" | "CANCELLED" | "EXPIRED";
          }>,
        }),
    supabase
      .from("maintenance_groups")
      .select("id, name, description")
      .eq("user_group_id", id)
      .order("created_at", { ascending: true }),
    activeTab === "gestao"
      ? activityQuery
      : Promise.resolve({ data: [] as Array<{
          id: string;
          entity_type:
            | "USER_GROUP"
            | "MEMBERSHIP"
            | "INVITATION"
            | "MAINTENANCE_GROUP"
            | "SERVICE"
            | "ROUTINE"
            | "EXECUTION";
          action:
            | "CREATED"
            | "UPDATED"
            | "DELETED"
            | "COMPLETED"
            | "RESCHEDULED"
            | "CANCELLED"
            | "INVITED"
            | "INVITE_ACCEPTED"
            | "INVITE_CANCELLED"
            | "INVITE_RESENT"
            | "MEMBER_LEFT"
            | "MEMBER_REMOVED"
            | "OWNER_SUCCEEDED"
            | "ROUTINE_RECALCULATED";
          actor_display_name: string;
          metadata: unknown;
          created_at: string;
        }> }),
  ]);

  const memberUserIds = (members ?? []).map((member) => member.user_id);
  const { data: profiles } =
    memberUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", memberUserIds)
      : { data: [] };

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  const memberCount = members?.length ?? 0;
  const maintenanceGroupIds = (maintenanceGroups ?? []).map((group) => group.id);
  const maintenanceGroupNameById = new Map(
    (maintenanceGroups ?? []).map((group) => [group.id, group.name]),
  );

  let calendarItems: Array<{
    id: string;
    scheduled_date: string;
    due_date: string;
    status: "PENDING" | "COMPLETED" | "CANCELLED";
    notes: string | null;
    completed_by_display_name: string | null;
    cancel_reason: string | null;
    serviceId: string;
    serviceTitle: string;
    maintenanceGroupId: string;
    maintenanceGroupName: string;
  }> = [];

  if (activeTab === "calendario" && maintenanceGroupIds.length > 0) {
    const { data: services } = await supabase
      .from("services")
      .select("id, title, maintenance_group_id")
      .in("maintenance_group_id", maintenanceGroupIds);

    const serviceIds = (services ?? []).map((service) => service.id);
    const serviceById = new Map(
      (services ?? []).map((service) => [service.id, service]),
    );

    if (serviceIds.length > 0) {
      const monthStart = `${calendarMonth}-01`;
      const [year, monthNumber] = calendarMonth.split("-").map(Number);
      const nextMonthDate = new Date(year, monthNumber, 1);
      const monthEndExclusive = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-01`;

      const { data: pendingExecutions } = await supabase
        .from("service_executions")
        .select(
          "id, service_id, scheduled_date, due_date, status, notes, completed_by_display_name, cancel_reason",
        )
        .in("service_id", serviceIds)
        .eq("status", "PENDING")
        .gte("due_date", monthStart)
        .lt("due_date", monthEndExclusive)
        .order("due_date", { ascending: true })
        .limit(300);

      calendarItems = (pendingExecutions ?? []).flatMap((execution) => {
        const service = serviceById.get(execution.service_id);
        if (!service) return [];
        return [
          {
            id: execution.id,
            scheduled_date: execution.scheduled_date,
            due_date: execution.due_date,
            status: execution.status,
            notes: execution.notes,
            completed_by_display_name: execution.completed_by_display_name,
            cancel_reason: execution.cancel_reason,
            serviceId: service.id,
            serviceTitle: service.title,
            maintenanceGroupId: service.maintenance_group_id,
            maintenanceGroupName:
              maintenanceGroupNameById.get(service.maintenance_group_id) ??
              "Manutenção",
          },
        ];
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up space-y-4">
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para os grupos
        </Link>

        <div className="rounded-3xl border border-border bg-white/85 p-5 shadow-[0_12px_36px_rgba(43,22,12,0.05)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
                  {group.name}
                </h1>
                <Badge
                  variant={
                    membership.role === "OWNER" ? "default" : "secondary"
                  }
                >
                  {formatMemberRole(membership.role)}
                </Badge>
              </div>
              {group.description ? (
                <p className="max-w-2xl text-muted-foreground">
                  {group.description}
                </p>
              ) : null}
            </div>
            <p className="rounded-full bg-[#FFF1D2] px-3 py-1 text-sm font-medium text-primary">
              {memberCount} {memberCount === 1 ? "membro" : "membros"}
            </p>
          </div>
        </div>

        <GroupTabs
          userGroupId={id}
          activeTab={activeTab}
          calendarMonth={calendarMonth}
        />
      </div>

      {activeTab === "calendario" ? (
        <PendenciesCalendar
          userGroupId={id}
          month={calendarMonth}
          selectedDay={selectedDay}
          items={calendarItems}
        />
      ) : (
        <>
          <MaintenanceGroupsPanel
            userGroupId={id}
            groups={maintenanceGroups ?? []}
            isOwner={isOwner}
          />

          <GroupInvitationsPanel
            userGroupId={id}
            invitations={invitations ?? []}
            isOwner={isOwner}
          />

          <ActivityLogPanel
            userGroupId={id}
            logs={(activityLogs ?? []).map((log) => ({
              ...log,
              metadata:
                log.metadata &&
                typeof log.metadata === "object" &&
                !Array.isArray(log.metadata)
                  ? (log.metadata as Record<string, unknown>)
                  : null,
            }))}
            entity={activityEntity}
            period={activityPeriod}
          />

          <section className="animate-fade-up-delay space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
                  Membros
                </h2>
                <p className="text-sm text-muted-foreground">
                  Quem participa deste espaço compartilhado.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border bg-white/85">
              {(members ?? []).map((member, index) => {
                const profile = profilesById.get(member.user_id);
                const name = profile?.display_name ?? "Membro desconhecido";
                const initials = name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? "")
                  .join("");

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 ${
                      index < (members?.length ?? 0) - 1
                        ? "border-b border-border/70"
                        : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF1D2] text-sm font-semibold text-primary">
                        {initials || "?"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Entrou em {formatJoinedDate(member.joined_at)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        member.role === "OWNER" ? "default" : "secondary"
                      }
                    >
                      {formatMemberRole(member.role)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
