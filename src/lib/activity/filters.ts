import type { ActivityPeriod } from "@/features/activity/activity-filters";
import type { ActivityEntityType } from "@/lib/i18n/labels";

const ENTITY_TYPES: ActivityEntityType[] = [
  "USER_GROUP",
  "MEMBERSHIP",
  "INVITATION",
  "MAINTENANCE_GROUP",
  "SERVICE",
  "ROUTINE",
  "EXECUTION",
];

const PERIODS: ActivityPeriod[] = ["7d", "30d", "90d", "all"];

export function parseActivityEntity(
  value: string | undefined,
): ActivityEntityType | "ALL" {
  if (!value || value === "ALL") return "ALL";
  return ENTITY_TYPES.includes(value as ActivityEntityType)
    ? (value as ActivityEntityType)
    : "ALL";
}

export function parseActivityPeriod(
  value: string | undefined,
): ActivityPeriod {
  if (!value) return "30d";
  return PERIODS.includes(value as ActivityPeriod)
    ? (value as ActivityPeriod)
    : "30d";
}

export function activityPeriodStart(period: ActivityPeriod): string | null {
  if (period === "all") return null;
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
