import { Wrench } from "lucide-react";

import { CreateMaintenanceGroupForm } from "@/features/maintenance-groups/create-maintenance-group-form";
import { MaintenanceGroupItem } from "@/features/maintenance-groups/maintenance-group-item";

type MaintenanceGroup = {
  id: string;
  name: string;
  description: string | null;
};

type MaintenanceGroupsPanelProps = {
  userGroupId: string;
  groups: MaintenanceGroup[];
  isOwner: boolean;
};

export function MaintenanceGroupsPanel({
  userGroupId,
  groups,
  isOwner,
}: MaintenanceGroupsPanelProps) {
  return (
    <section className="animate-fade-up-delay-2 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
            Grupos de manutenção
          </h2>
          <p className="text-sm text-muted-foreground">
            Organize espaços ou áreas onde os serviços vão viver.
          </p>
        </div>
        <CreateMaintenanceGroupForm userGroupId={userGroupId} />
      </div>

      {groups.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-white/85">
          {groups.map((group, index) => (
            <div
              key={group.id}
              className={
                index < groups.length - 1 ? "border-b border-border/70" : ""
              }
            >
              <MaintenanceGroupItem
                userGroupId={userGroupId}
                group={group}
                canDelete={isOwner}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/25 bg-white/70 px-5 py-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#FFF1D2] text-primary">
            <Wrench className="size-5" />
          </div>
          <p className="font-medium text-foreground">
            Nenhum grupo de manutenção ainda
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Crie o primeiro para começar a organizar serviços e rotinas neste
            espaço.
          </p>
        </div>
      )}
    </section>
  );
}
