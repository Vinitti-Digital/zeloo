import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatJoinedDate, formatMemberRole } from "@/lib/i18n/labels";
import { createClient } from "@/lib/supabase/server";

type GroupPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage({ params }: GroupPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: group } = await supabase
    .from("user_groups")
    .select("id, name, description, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!group) {
    notFound();
  }

  const { data: membership } = await supabase
    .from("user_group_members")
    .select("role, status")
    .eq("user_group_id", id)
    .eq("user_id", user!.id)
    .eq("status", "ACTIVE")
    .maybeSingle();

  const { data: members } = await supabase
    .from("user_group_members")
    .select("id, role, status, joined_at, user_id")
    .eq("user_group_id", id)
    .eq("status", "ACTIVE")
    .order("joined_at", { ascending: true });

  const memberUserIds = (members ?? []).map((member) => member.user_id);
  const { data: profiles } =
    memberUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", memberUserIds)
      : { data: [] };

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  const memberCount = members?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="animate-fade-up space-y-4">
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para os grupos
        </Link>

        <div className="rounded-3xl border border-border bg-white/85 p-5 shadow-[0_12px_36px_rgba(43,22,12,0.05)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
                  {group.name}
                </h1>
                {membership ? (
                  <Badge
                    variant={
                      membership.role === "OWNER" ? "default" : "secondary"
                    }
                  >
                    {formatMemberRole(membership.role)}
                  </Badge>
                ) : null}
              </div>
              {group.description ? (
                <p className="max-w-2xl text-muted-foreground">
                  {group.description}
                </p>
              ) : null}
            </div>
            <p className="rounded-full bg-[#FFF1D2] px-3 py-1 text-sm font-medium text-primary">
              {memberCount} {memberCount === 1 ? "membro" : "membros"}
            </p>
          </div>
        </div>
      </div>

      <section className="animate-fade-up-delay space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
              Membros
            </h2>
            <p className="text-sm text-muted-foreground">
              Quem participa deste espaço compartilhado.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-white/85">
          {(members ?? []).map((member, index) => {
            const profile = profilesById.get(member.user_id);
            const name = profile?.display_name ?? "Membro desconhecido";
            const initials = name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("");

            return (
              <div
                key={member.id}
                className={`flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 ${
                  index < (members?.length ?? 0) - 1
                    ? "border-b border-border/70"
                    : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF1D2] text-sm font-semibold text-primary">
                    {initials || "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Entrou em {formatJoinedDate(member.joined_at)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={member.role === "OWNER" ? "default" : "secondary"}
                >
                  {formatMemberRole(member.role)}
                </Badge>
              </div>
            );
          })}
        </div>
      </section>

      <section className="animate-fade-up-delay-2 rounded-3xl border border-highlight/40 bg-[linear-gradient(135deg,#FFF1D2_0%,#FFFFFF_70%)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-highlight/30 text-primary">
            <Sparkles className="size-4" />
          </span>
          <div className="space-y-1">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-foreground">
              Em breve neste grupo
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Aqui vão aparecer grupos de manutenção, serviços, rotinas e
              execuções — o próximo passo da jornada Zeloo.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
