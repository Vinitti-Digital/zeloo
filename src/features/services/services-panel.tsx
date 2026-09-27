import Link from "next/link";
import { ChevronRight, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CreateServiceForm } from "@/features/services/create-service-form";
import {
  formatServicePriority,
  formatServiceStatus,
} from "@/lib/i18n/labels";

type MemberOption = {
  id: string;
  display_name: string;
};

type ServiceListItem = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null;
  status: "ACTIVE" | "COMPLETED";
  location: string | null;
};

type ServicesPanelProps = {
  userGroupId: string;
  maintenanceGroupId: string;
  services: ServiceListItem[];
  members: MemberOption[];
};

export function ServicesPanel({
  userGroupId,
  maintenanceGroupId,
  services,
  members,
}: ServicesPanelProps) {
  return (
    <section className="animate-fade-up-delay space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
            Serviços
          </h2>
          <p className="text-sm text-muted-foreground">
            Tarefas e manutenções deste espaço.
          </p>
        </div>
        <CreateServiceForm
          userGroupId={userGroupId}
          maintenanceGroupId={maintenanceGroupId}
          members={members}
        />
      </div>

      {services.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-white/85">
          {services.map((service, index) => (
            <Link
              key={service.id}
              href={`/groups/${userGroupId}/maintenance/${maintenanceGroupId}/services/${service.id}`}
              className={`flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-[#FFF8EA]/70 sm:px-5 ${
                index < services.length - 1 ? "border-b border-border/70" : ""
              }`}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-foreground">
                    {service.title}
                  </p>
                  <Badge
                    variant={
                      service.status === "ACTIVE" ? "default" : "secondary"
                    }
                  >
                    {formatServiceStatus(service.status)}
                  </Badge>
                  <Badge variant="outline">
                    {formatServicePriority(service.priority)}
                  </Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {service.location ||
                    service.description ||
                    "Sem descrição"}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/25 bg-white/70 px-5 py-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#FFF1D2] text-primary">
            <Wrench className="size-5" />
          </div>
          <p className="font-medium text-foreground">
            Nenhum serviço ainda
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Crie o primeiro serviço para organizar rotinas e execuções neste
            grupo de manutenção.
          </p>
        </div>
      )}
    </section>
  );
}
