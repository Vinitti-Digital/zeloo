"use client";

import { useActionState } from "react";

import {
  acceptInvitationAction,
  cancelInvitationAction,
} from "@/actions/invitations";
import type { ActionState } from "@/lib/actions/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

type AcceptInvitationButtonProps = {
  invitationId: string;
};

export function AcceptInvitationButton({
  invitationId,
}: AcceptInvitationButtonProps) {
  const [state, formAction, pending] = useActionState(
    acceptInvitationAction,
    initialState,
  );

  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="invitationId" value={invitationId} />
      {state.error ? (
        <Alert variant="destructive" className="mb-2 w-full basis-full">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Entrando..." : "Aceitar"}
      </Button>
    </form>
  );
}

type CancelInvitationButtonProps = {
  invitationId: string;
  userGroupId?: string;
  label?: string;
};

export function CancelInvitationButton({
  invitationId,
  userGroupId,
  label = "Cancelar",
}: CancelInvitationButtonProps) {
  const [state, formAction, pending] = useActionState(
    cancelInvitationAction,
    initialState,
  );

  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="invitationId" value={invitationId} />
      {userGroupId ? (
        <input type="hidden" name="userGroupId" value={userGroupId} />
      ) : null}
      {state.error ? (
        <Alert variant="destructive" className="mb-2 w-full basis-full">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button
        type="submit"
        size="sm"
        variant="outline"
        className="bg-white/80"
        disabled={pending}
      >
        {pending ? "..." : label}
      </Button>
    </form>
  );
}
