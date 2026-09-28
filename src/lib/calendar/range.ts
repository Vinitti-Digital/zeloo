import { addDays, format, parseISO } from "date-fns";

export function todayKey(now = new Date()): string {
  return format(now, "yyyy-MM-dd");
}

export function addDaysKey(dateKey: string, days: number): string {
  return format(addDays(parseISO(dateKey), days), "yyyy-MM-dd");
}

export function isOverdue(dueDate: string, today = todayKey()): boolean {
  return dueDate < today;
}

export function isWithinNextDays(
  dueDate: string,
  days: number,
  today = todayKey(),
): boolean {
  const end = addDaysKey(today, days - 1);
  return dueDate >= today && dueDate <= end;
}

export function isInUpcomingWindow(
  dueDate: string,
  days = 7,
  today = todayKey(),
): boolean {
  return isOverdue(dueDate, today) || isWithinNextDays(dueDate, days, today);
}
