import { BrandMascot } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import {
  ActivityFilters,
  type ActivityPeriod,
} from "@/features/activity/activity-filters";
import {
  type ActivityAction,
  type ActivityEntityType,
  formatActivityAction,
  formatActivityEntityType,
  formatActivitySubject,
  formatDateTime,
} from "@/lib/i18n/labels";

type ActivityLogItem = {
  id: string;
  entity_type: ActivityEntityType;
  action: ActivityAction;
  actor_display_name: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type ActivityLogPanelProps = {
  userGroupId: string;
  logs: ActivityLogItem[];
  entity: ActivityEntityType | "ALL";
  period: ActivityPeriod;
  collapsed?: boolean;
};

export function ActivityLogPanel({
  userGroupId,
  logs,
  entity,
  period,
  collapsed = false,
}: ActivityLogPanelProps) {
  const content = (
    <div className="space-y-3">
      <ActivityFilters
        userGroupId={userGroupId}
        entity={entity}
        period={period}
      />

      {logs.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-white/85">
          {logs.map((log, index) => {
            const subject = formatActivitySubject(log.entity_type, log.metadata);
            const initials = log.actor_display_name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("");

            return (
              <div
                key={log.id}
                className={`flex items-start gap-3 px-4 py-3.5 sm:px-5 ${
                  index < logs.length - 1 ? "border-b border-border/70" : ""
                }`}
              >
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF1D2] text-sm font-semibold text-primary">
                  {initials || "?"}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm leading-relaxed text-foreground">
                    <span className="font-semibold">
                      {log.actor_display_name}
                    </span>{" "}
                    {formatActivityAction(log.action)}{" "}
                    <span className="text-muted-foreground">
                      {formatActivityEntityType(log.entity_type).toLowerCase()}
                    </span>
                    {subject ? (
                      <>
                        :{" "}
                        <span className="font-medium text-foreground">
                          {subject}
                        </span>
                      </>
                    ) : null}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {formatActivityEntityType(log.entity_type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                </div>
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
            Nenhuma atividade neste filtro
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Quando o grupo receber convites, tarefas ou pendências, o histórico
            aparece aqui.
          </p>
        </div>
      )}
    </div>
  );

  if (collapsed) {
    return (
      <section className="animate-fade-up-delay">
        <details className="rounded-3xl border border-border bg-white/85 open:pb-4">
          <summary className="cursor-pointer list-none px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
                  Histórico
                </h2>
                <p className="text-sm text-muted-foreground">
                  Atividades recentes do grupo — toque para ver.
                </p>
              </div>
              <Badge variant="outline">Ver histórico</Badge>
            </div>
          </summary>
          <div className="space-y-3 px-5 sm:px-6">{content}</div>
        </details>
      </section>
    );
  }

  return (
    <section className="animate-fade-up-delay space-y-3">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
          Histórico
        </h2>
        <p className="text-sm text-muted-foreground">
          O que aconteceu neste grupo.
        </p>
      </div>
      {content}
    </section>
  );
}
