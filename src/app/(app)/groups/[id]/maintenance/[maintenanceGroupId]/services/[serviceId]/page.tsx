import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ExecutionsPanel } from "@/features/executions/executions-panel";
import { RoutineForm } from "@/features/routines/routine-form";
import { ServiceEditForm } from "@/features/services/service-edit-form";
import { createClient } from "@/lib/supabase/server";

type ServicePageProps = {
  params: Promise<{
    id: string;
    maintenanceGroupId: string;
    serviceId: string;
  }>;
};

function yesterdayDateOnly() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { id, maintenanceGroupId, serviceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: membership } = await supabase
    .from("user_group_members")
    .select("role, status")
    .eq("user_group_id", id)
    .eq("user_id", user.id)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const isOwner = membership.role === "OWNER";

  const { data: maintenanceGroup } = await supabase
    .from("maintenance_groups")
    .select("id, name, user_group_id")
    .eq("id", maintenanceGroupId)
    .eq("user_group_id", id)
    .maybeSingle();

  if (!maintenanceGroup) {
    notFound();
  }

  const { data: service } = await supabase
    .from("services")
    .select(
      "id, title, description, priority, responsible_user_id, location, estimated_cost, notes, status, maintenance_group_id",
    )
    .eq("id", serviceId)
    .eq("maintenance_group_id", maintenanceGroupId)
    .maybeSingle();

  if (!service) {
    notFound();
  }

  const [{ data: members }, { data: routine }, { data: executions }] =
    await Promise.all([
      supabase
        .from("user_group_members")
        .select("user_id")
        .eq("user_group_id", id)
        .eq("status", "ACTIVE"),
      supabase
        .from("service_routines")
        .select(
          "id, frequency, interval_value, base_date, end_date, weekdays, month_day, is_active",
        )
        .eq("service_id", serviceId)
        .maybeSingle(),
      supabase
        .from("service_executions")
        .select(
          "id, scheduled_date, due_date, status, notes, completed_by_display_name, cancel_reason",
        )
        .eq("service_id", serviceId)
        .order("due_date", { ascending: false })
        .limit(50),
    ]);

  const memberUserIds = (members ?? []).map((member) => member.user_id);
  const { data: profiles } =
    memberUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", memberUserIds)
      : { data: [] };

  const memberOptions = (profiles ?? []).map((profile) => ({
    id: profile.id,
    display_name: profile.display_name,
  }));

  let previewDate: string | null = null;
  if (routine) {
    const { data: nextOccurrence } = await supabase.rpc(
      "compute_next_occurrence",
      {
        p_base_date: routine.base_date,
        p_frequency: routine.frequency,
        p_interval: routine.interval_value,
        p_after_date: yesterdayDateOnly(),
        p_weekdays: routine.weekdays ?? undefined,
        p_month_day: routine.month_day ?? undefined,
        p_end_date: routine.end_date ?? undefined,
      },
    );
    previewDate = nextOccurrence ?? null;
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up space-y-2">
        <Link
          href={`/groups/${id}/maintenance/${maintenanceGroupId}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para {maintenanceGroup.name}
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
          {service.title}
        </h1>
      </div>

      <ServiceEditForm
        userGroupId={id}
        maintenanceGroupId={maintenanceGroupId}
        service={service}
        members={memberOptions}
        canDelete={isOwner}
      />

      <RoutineForm
        mode={routine ? "edit" : "create"}
        userGroupId={id}
        maintenanceGroupId={maintenanceGroupId}
        serviceId={serviceId}
        routine={routine ?? undefined}
        previewDate={previewDate}
        canDelete={isOwner}
      />

      <ExecutionsPanel
        userGroupId={id}
        maintenanceGroupId={maintenanceGroupId}
        serviceId={serviceId}
        executions={executions ?? []}
      />
    </div>
  );
}
