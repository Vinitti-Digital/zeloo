import { BrandMascot } from "@/components/brand/logo";
import { CreateOneOffForm } from "@/features/executions/create-one-off-form";
import { ExecutionItem } from "@/features/executions/execution-item";

type ExecutionListItem = {
  id: string;
  scheduled_date: string;
  due_date: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  completed_by_display_name: string | null;
  cancel_reason: string | null;
};

type ExecutionsPanelProps = {
  userGroupId: string;
  maintenanceGroupId: string;
  serviceId: string;
  executions: ExecutionListItem[];
};

export function ExecutionsPanel({
  userGroupId,
  maintenanceGroupId,
  serviceId,
  executions,
}: ExecutionsPanelProps) {
  const pending = executions.filter((item) => item.status === "PENDING");
  const history = executions.filter((item) => item.status !== "PENDING");

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
            Execuções
          </h2>
          <p className="text-sm text-muted-foreground">
            Pendências e histórico deste serviço.
          </p>
        </div>
        <CreateOneOffForm
          userGroupId={userGroupId}
          maintenanceGroupId={maintenanceGroupId}
          serviceId={serviceId}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Pendentes
        </h3>
        {pending.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-border bg-white/85">
            {pending.map((execution, index) => (
              <div
                key={execution.id}
                className={
                  index < pending.length - 1 ? "border-b border-border/70" : ""
                }
              >
                <ExecutionItem
                  execution={execution}
                  userGroupId={userGroupId}
                  maintenanceGroupId={maintenanceGroupId}
                  serviceId={serviceId}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-primary/25 bg-white/70 px-5 py-6 text-center">
            <div className="mx-auto mb-2 flex justify-center">
              <BrandMascot width={80} />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhuma execução pendente.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Histórico
        </h3>
        {history.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-border bg-white/85">
            {history.map((execution, index) => (
              <div
                key={execution.id}
                className={
                  index < history.length - 1 ? "border-b border-border/70" : ""
                }
              >
                <ExecutionItem
                  execution={execution}
                  userGroupId={userGroupId}
                  maintenanceGroupId={maintenanceGroupId}
                  serviceId={serviceId}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ainda não há execuções concluídas ou canceladas.
          </p>
        )}
      </div>
    </section>
  );
}
