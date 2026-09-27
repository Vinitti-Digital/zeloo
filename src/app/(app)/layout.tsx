import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import { BrandLockup } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name ?? user.email ?? "Você";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="min-h-full flex flex-1 flex-col surface-atmosphere">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-[#FFFDF8CC] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/groups" aria-label="Zeloo" className="shrink-0">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-white/80 py-1 pr-3 pl-1">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {initials || "Z"}
              </span>
              <span className="hidden max-w-36 truncate text-sm text-foreground sm:inline">
                {displayName}
              </span>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm" className="bg-white/80">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
