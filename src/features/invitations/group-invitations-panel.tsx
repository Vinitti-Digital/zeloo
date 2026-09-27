import { CreateInvitationForm } from "@/features/invitations/create-invitation-form";
import { CancelInvitationButton } from "@/features/invitations/invitation-actions";
import { formatJoinedDate } from "@/lib/i18n/labels";

type PendingInvitation = {
  id: string;
  email: string;
  invited_by_display_name: string;
  expires_at: string;
  created_at: string;
};

type GroupInvitationsPanelProps = {
  userGroupId: string;
  invitations: PendingInvitation[];
  isOwner: boolean;
};

export function GroupInvitationsPanel({
  userGroupId,
  invitations,
  isOwner,
}: GroupInvitationsPanelProps) {
  if (!isOwner) {
    return null;
  }

  return (
    <section className="animate-fade-up-delay space-y-3">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
          Convites
        </h2>
        <p className="text-sm text-muted-foreground">
          Chame pessoas pelo e-mail da conta delas no Zeloo.
        </p>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-white/85 p-4 sm:p-5">
        <CreateInvitationForm userGroupId={userGroupId} />

        {invitations.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border/80">
            {invitations.map((invitation, index) => (
              <div
                key={invitation.id}
                className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${
                  index < invitations.length - 1
                    ? "border-b border-border/70"
                    : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {invitation.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enviado em {formatJoinedDate(invitation.created_at)} ·
                    expira em {formatJoinedDate(invitation.expires_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <CancelInvitationButton
                    invitationId={invitation.id}
                    userGroupId={userGroupId}
                    label="Cancelar convite"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum convite pendente no momento.
          </p>
        )}
      </div>
    </section>
  );
}
