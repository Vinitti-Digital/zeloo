import Link from "next/link";
import { CalendarDays, Settings2 } from "lucide-react";

import type { GroupTab } from "@/lib/group/tabs";
import { cn } from "@/lib/utils";

type GroupTabsProps = {
  userGroupId: string;
  activeTab: GroupTab;
  calendarMonth?: string;
};

export function GroupTabs({
  userGroupId,
  activeTab,
  calendarMonth,
}: GroupTabsProps) {
  const gestaoHref = `/groups/${userGroupId}`;
  const calendarioHref = calendarMonth
    ? `/groups/${userGroupId}?tab=calendario&month=${calendarMonth}`
    : `/groups/${userGroupId}?tab=calendario`;

  return (
    <nav
      aria-label="Seções do grupo"
      className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-[#FFFDF8] p-1"
    >
      <Link
        href={gestaoHref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          activeTab === "gestao"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-white hover:text-foreground",
        )}
      >
        <Settings2 className="size-4" aria-hidden />
        Gestão
      </Link>
      <Link
        href={calendarioHref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          activeTab === "calendario"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-white hover:text-foreground",
        )}
      >
        <CalendarDays className="size-4" aria-hidden />
        Calendário
      </Link>
    </nav>
  );
}
