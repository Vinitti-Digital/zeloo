import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { BrandMascot } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { ExecutionItem } from "@/features/executions/execution-item";
import {
  WEEKDAY_LABELS,
  adjacentMonth,
  calendarDays,
  isInMonth,
  isSameDateKey,
  monthLabel,
  toDateKey,
} from "@/lib/calendar/month";
import { formatDateOnly } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";

export type CalendarPendingItem = {
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
};

type PendenciesCalendarProps = {
  userGroupId: string;
  month: string;
  selectedDay: string;
  items: CalendarPendingItem[];
};

export function PendenciesCalendar({
  userGroupId,
  month,
  selectedDay,
  items,
}: PendenciesCalendarProps) {
  const days = calendarDays(month);
  const prevMonth = adjacentMonth(month, -1);
  const nextMonth = adjacentMonth(month, 1);
  const countsByDay = new Map<string, number>();

  for (const item of items) {
    const key = item.due_date;
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const dayItems = items
    .filter((item) => item.due_date === selectedDay)
    .sort((a, b) => a.serviceTitle.localeCompare(b.serviceTitle, "pt-BR"));

  const monthPendingCount = items.filter((item) =>
    item.due_date.startsWith(month),
  ).length;

  return (
    <section className="animate-fade-up-delay space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
          Calendário
        </h2>
        <p className="text-sm text-muted-foreground">
          Pendências por data de vencimento
          {monthPendingCount > 0
            ? ` · ${monthPendingCount} neste mês`
            : ""}.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-white/85 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href={`/groups/${userGroupId}?tab=calendario&month=${prevMonth}`}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-[#FFFDF8] text-foreground transition-colors hover:bg-[#FFF1D2]"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <p className="font-[family-name:var(--font-display)] text-xl capitalize text-foreground">
            {monthLabel(month)}
          </p>
          <Link
            href={`/groups/${userGroupId}?tab=calendario&month=${nextMonth}`}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-[#FFFDF8] text-foreground transition-colors hover:bg-[#FFF1D2]"
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground sm:gap-2">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((date) => {
            const key = toDateKey(date);
            const inMonth = isInMonth(date, month);
            const selected = isSameDateKey(date, selectedDay);
            const count = countsByDay.get(key) ?? 0;
            const href = `/groups/${userGroupId}?tab=calendario&month=${month}&day=${key}`;

            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center rounded-xl border px-1 py-2 text-sm transition-colors sm:min-h-16",
                  inMonth
                    ? "border-border/70 bg-[#FFFDF8] text-foreground hover:border-primary/30 hover:bg-[#FFF1D2]"
                    : "border-transparent bg-transparent text-muted-foreground/45",
                  selected && inMonth
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    : null,
                )}
              >
                <span className="font-medium">{date.getDate()}</span>
                {count > 0 ? (
                  <span
                    className={cn(
                      "mt-1 rounded-md px-1.5 text-[10px] font-semibold leading-4",
                      selected
                        ? "bg-white/20 text-primary-foreground"
                        : "bg-[#FFF1D2] text-primary",
                    )}
                  >
                    {count}
                  </span>
                ) : (
                  <span className="mt-1 h-4" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-xl text-foreground">
              Pendências do dia
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatDateOnly(selectedDay)}
            </p>
          </div>
          <Badge variant="secondary">
            {dayItems.length}{" "}
            {dayItems.length === 1 ? "pendência" : "pendências"}
          </Badge>
        </div>

        {dayItems.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-border bg-white/85">
            {dayItems.map((item, index) => (
              <div
                key={item.id}
                className={
                  index < dayItems.length - 1 ? "border-b border-border/70" : ""
                }
              >
                <div className="space-y-1 border-b border-border/40 px-4 pt-3.5 sm:px-5">
                  <p className="font-medium text-foreground">
                    {item.serviceTitle}
                  </p>
                  <p className="pb-1 text-xs text-muted-foreground">
                    {item.maintenanceGroupName}
                    {" · "}
                    <Link
                      href={`/groups/${userGroupId}/maintenance/${item.maintenanceGroupId}/services/${item.serviceId}`}
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      Abrir serviço
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
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-primary/25 bg-white/70 px-5 py-8 text-center">
            <div className="mx-auto mb-3 flex justify-center">
              <BrandMascot width={96} />
            </div>
            <p className="font-medium text-foreground">
              Nenhuma pendência neste dia
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Escolha outro dia no calendário ou cadastre rotinas e execuções na
              aba Gestão.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
