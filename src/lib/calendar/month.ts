import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function monthLabel(month: string): string {
  const date = parseISO(`${month}-01`);
  return format(date, "MMMM yyyy", { locale: ptBR });
}

export function adjacentMonth(month: string, direction: -1 | 1): string {
  const date = parseISO(`${month}-01`);
  const next = direction === 1 ? addMonths(date, 1) : subMonths(date, 1);
  return format(next, "yyyy-MM");
}

export function calendarDays(month: string): Date[] {
  const monthDate = parseISO(`${month}-01`);
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function isInMonth(date: Date, month: string): boolean {
  return isSameMonth(date, parseISO(`${month}-01`));
}

export function isSameDateKey(date: Date, day: string): boolean {
  return isSameDay(date, parseISO(day));
}

export const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
