import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/groups"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to groups
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-[#1f4b3a]">
            {group.name}
          </h1>
          {membership ? <Badge>{membership.role}</Badge> : null}
        </div>
        {group.description ? (
          <p className="text-muted-foreground">{group.description}</p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Active members of this collaborative group.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(members ?? []).map((member) => {
            const profile = profilesById.get(member.user_id);

            return (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">
                    {profile?.display_name ?? "Unknown member"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">{member.role}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next steps</CardTitle>
          <CardDescription>
            Foundation is ready. Maintenance groups, services, and routines come
            in the next iteration.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
