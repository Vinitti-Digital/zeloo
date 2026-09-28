import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActivityEntityType } from "@/lib/i18n/labels";
import { formatActivityEntityType } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";

const ENTITY_OPTIONS: Array<ActivityEntityType | "ALL"> = [
  "ALL",
  "USER_GROUP",
  "MEMBERSHIP",
  "INVITATION",
  "MAINTENANCE_GROUP",
  "SERVICE",
  "ROUTINE",
  "EXECUTION",
];

const PERIOD_OPTIONS = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "all", label: "Tudo" },
] as const;

export type ActivityPeriod = (typeof PERIOD_OPTIONS)[number]["value"];

type ActivityFiltersProps = {
  userGroupId: string;
  entity: ActivityEntityType | "ALL";
  period: ActivityPeriod;
};

export function ActivityFilters({
  userGroupId,
  entity,
  period,
}: ActivityFiltersProps) {
  return (
    <form
      action={`/groups/${userGroupId}`}
      method="get"
      className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-[#FFFDF8] p-3 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="tab" value="organizar" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Label htmlFor="activity-entity">Tipo</Label>
        <select
          id="activity-entity"
          name="entity"
          defaultValue={entity}
          className="flex h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {ENTITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "ALL"
                ? "Todos os tipos"
                : formatActivityEntityType(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <Label htmlFor="activity-period">Período</Label>
        <select
          id="activity-period"
          name="period"
          defaultValue={period}
          className="flex h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1 sm:flex-none">
          Filtrar
        </Button>
        {entity !== "ALL" || period !== "30d" ? (
          <Link
            href={`/groups/${userGroupId}?tab=organizar`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-1 bg-white sm:flex-none",
            )}
          >
            Limpar
          </Link>
        ) : null}
      </div>
    </form>
  );
}
