import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateUserGroupForm } from "@/features/user-groups/create-user-group-form";
import { formatMemberRole } from "@/lib/i18n/labels";
import { createClient } from "@/lib/supabase/server";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("user_group_members")
    .select("role, user_group_id, joined_at")
    .eq("user_id", user!.id)
    .eq("status", "ACTIVE")
    .order("joined_at", { ascending: true });

  const groupIds = (memberships ?? []).map((item) => item.user_group_id);

  const { data: groups } =
    groupIds.length > 0
      ? await supabase
          .from("user_groups")
          .select("id, name, description, created_at")
          .in("id", groupIds)
      : { data: [] };

  const groupsById = new Map((groups ?? []).map((group) => [group.id, group]));

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[#1f4b3a]">
          Seus grupos
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Escolha um grupo para gerenciar manutenções ou crie um novo espaço
          compartilhado.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Grupos ativos
        </h2>
        {memberships && memberships.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {memberships.map((membership) => {
              const group = groupsById.get(membership.user_group_id);
              if (!group) {
                return null;
              }

              return (
                <Link key={group.id} href={`/groups/${group.id}`}>
                  <Card className="h-full transition-colors hover:border-[#1f4b3a]/40">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle>{group.name}</CardTitle>
                        <Badge variant="secondary">
                          {formatMemberRole(membership.role)}
                        </Badge>
                      </div>
                      {group.description ? (
                        <CardDescription>{group.description}</CardDescription>
                      ) : (
                        <CardDescription>Sem descrição</CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border/70 bg-background/50 px-4 py-6 text-sm text-muted-foreground">
            Você ainda não participa de nenhum grupo. Crie o primeiro abaixo.
          </p>
        )}
      </section>

      <section>
        <CreateUserGroupForm />
      </section>
    </div>
  );
}
