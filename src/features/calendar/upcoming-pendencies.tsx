import Link from "next/link";

import { BrandMascot } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import type { CalendarPendingItem } from "@/features/calendar/pendencies-calendar";
import { ExecutionItem } from "@/features/executions/execution-item";
import { isOverdue, todayKey } from "@/lib/calendar/range";
import { formatDateOnly } from "@/lib/i18n/labels";

type UpcomingPendenciesProps = {
  userGroupId: string;
  items: CalendarPendingItem[];
};

export function UpcomingPendencies({
  userGroupId,
  items,
}: UpcomingPendenciesProps) {
  const today = todayKey();
  const overdue = items
    .filter((item) => isOverdue(item.due_date, today))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  const upcoming = items
    .filter((item) => !isOverdue(item.due_date, today))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  const ordered = [...overdue, ...upcoming];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
            Próximos 7 dias
          </h2>
          <p className="text-sm text-muted-foreground">
            Atrasadas primeiro, depois o que vence nesta semana.
          </p>
        </div>
        <Badge variant="secondary">
          {ordered.length}{" "}
          {ordered.length === 1 ? "pendência" : "pendências"}
        </Badge>
      </div>

      {ordered.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-white/85">
          {ordered.map((item, index) => {
            const overdueItem = isOverdue(item.due_date, today);
            return (
              <div
                key={item.id}
                className={
                  index < ordered.length - 1 ? "border-b border-border/70" : ""
                }
              >
                <div className="space-y-1 border-b border-border/40 px-4 pt-3.5 sm:px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">
                      {item.serviceTitle}
                    </p>
                    {overdueItem ? (
                      <Badge variant="destructive">Atrasada</Badge>
                    ) : item.due_date === today ? (
                      <Badge>Hoje</Badge>
                    ) : null}
                  </div>
                  <p className="pb-1 text-xs text-muted-foreground">
                    {item.maintenanceGroupName}
                    {" · Vence em "}
                    {formatDateOnly(item.due_date)}
                    {" · "}
                    <Link
                      href={`/groups/${userGroupId}/maintenance/${item.maintenanceGroupId}/services/${item.serviceId}`}
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      Abrir tarefa
                    </Link>
                  </p>
                </div>
                <ExecutionItem
                  execution={item}
                  userGroupId={userGroupId}
                  maintenanceGroupId={item.maintenanceGroupId}
                  serviceId={item.serviceId}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/25 bg-white/70 px-5 py-8 text-center">
          <div className="mx-auto mb-3 flex justify-center">
            <BrandMascot width={96} />
          </div>
          <p className="font-medium text-foreground">
            Nenhuma pendência nos próximos 7 dias
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Quando houver tarefas para fazer, elas aparecem aqui. Use Organizar
            para cadastrar espaços e tarefas.
          </p>
        </div>
      )}
    </section>
  );
}
