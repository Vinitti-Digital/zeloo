import {
  AcceptInvitationButton,
  CancelInvitationButton,
} from "@/features/invitations/invitation-actions";
import { formatJoinedDate } from "@/lib/i18n/labels";

type PendingInvite = {
  id: string;
  user_group_id: string;
  invited_by_display_name: string;
  expires_at: string;
  groupName: string;
};

type MyPendingInvitationsProps = {
  invitations: PendingInvite[];
};

export function MyPendingInvitations({
  invitations,
}: MyPendingInvitationsProps) {
  if (invitations.length === 0) {
    return null;
  }

  return (
    <section className="animate-fade-up-delay space-y-3">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
          Convites para você
        </h2>
        <p className="text-sm text-muted-foreground">
          Aceite para entrar no grupo ou recuse se não for para você.
        </p>
      </div>

      <div className="grid gap-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="rounded-3xl border border-highlight/40 bg-[linear-gradient(135deg,#FFF1D2_0%,#FFFFFF_70%)] p-4 sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="font-[family-name:var(--font-display)] text-xl text-foreground">
                  {invitation.groupName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Convite de {invitation.invited_by_display_name} · expira em{" "}
                  {formatJoinedDate(invitation.expires_at)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AcceptInvitationButton invitationId={invitation.id} />
                <CancelInvitationButton
                  invitationId={invitation.id}
                  userGroupId={invitation.user_group_id}
                  label="Recusar"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
