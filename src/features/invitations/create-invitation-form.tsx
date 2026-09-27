"use client";

import { useActionState } from "react";
import { MailPlus } from "lucide-react";

import { createInvitationAction } from "@/actions/invitations";
import type { ActionState } from "@/lib/actions/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

type CreateInvitationFormProps = {
  userGroupId: string;
};

export function CreateInvitationForm({
  userGroupId,
}: CreateInvitationFormProps) {
  const [state, formAction, pending] = useActionState(
    createInvitationAction,
    initialState,
  );

  return (
    <form
      key={state.success ?? "invite-form"}
      action={formAction}
      className="space-y-3"
    >
      <input type="hidden" name="userGroupId" value={userGroupId} />

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.success ? (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="invite-email">E-mail para convidar</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="invite-email"
            name="email"
            type="email"
            placeholder="pessoa@email.com"
            required
            className="sm:flex-1"
          />
          <Button type="submit" disabled={pending} className="sm:shrink-0">
            <MailPlus data-icon="inline-start" />
            {pending ? "Enviando..." : "Convidar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
