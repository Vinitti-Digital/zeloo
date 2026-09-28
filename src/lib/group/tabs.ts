export type GroupTab = "pendencias" | "organizar";

export function parseGroupTab(value: string | undefined): GroupTab {
  if (value === "organizar" || value === "gestao") return "organizar";
  return "pendencias";
}

export function parseCalendarMonth(value: string | undefined): string {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12) {
      return value;
    }
  }
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function parseCalendarDay(
  value: string | undefined,
  month: string,
): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    if (value.startsWith(month)) return value;
  }
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (today.startsWith(month)) return today;
  return `${month}-01`;
}
