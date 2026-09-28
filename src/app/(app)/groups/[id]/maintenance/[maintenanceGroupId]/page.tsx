import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ServicesPanel } from "@/features/services/services-panel";
import { createClient } from "@/lib/supabase/server";

type MaintenanceGroupPageProps = {
  params: Promise<{ id: string; maintenanceGroupId: string }>;
};

export default async function MaintenanceGroupPage({
  params,
}: MaintenanceGroupPageProps) {
  const { id, maintenanceGroupId } = await params;
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

  const { data: maintenanceGroup } = await supabase
    .from("maintenance_groups")
    .select("id, name, description, user_group_id")
    .eq("id", maintenanceGroupId)
    .eq("user_group_id", id)
    .maybeSingle();

  if (!maintenanceGroup) {
    notFound();
  }

  const [{ data: services }, { data: members }] = await Promise.all([
    supabase
      .from("services")
      .select(
        "id, title, description, priority, status, location, created_at",
      )
      .eq("maintenance_group_id", maintenanceGroupId)
      .order("created_at", { ascending: true }),
    supabase
      .from("user_group_members")
      .select("user_id")
      .eq("user_group_id", id)
      .eq("status", "ACTIVE"),
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

  return (
    <div className="space-y-6">
      <div className="animate-fade-up space-y-4">
        <Link
          href={`/groups/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar às pendências
        </Link>

        <div className="rounded-3xl border border-border bg-white/85 p-5 shadow-[0_12px_36px_rgba(43,22,12,0.05)] sm:p-6">
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
            {maintenanceGroup.name}
          </h1>
          {maintenanceGroup.description ? (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {maintenanceGroup.description}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Sem descrição
            </p>
          )}
        </div>
      </div>

      <ServicesPanel
        userGroupId={id}
        maintenanceGroupId={maintenanceGroupId}
        services={services ?? []}
        members={memberOptions}
      />
    </div>
  );
}
