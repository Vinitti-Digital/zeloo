"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";

import { createOneOffExecutionAction } from "@/actions/services";
import type { ActionState } from "@/lib/actions/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

type CreateOneOffFormProps = {
  userGroupId: string;
  maintenanceGroupId: string;
  serviceId: string;
};

export function CreateOneOffForm({
  userGroupId,
  maintenanceGroupId,
  serviceId,
}: CreateOneOffFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createOneOffExecutionAction,
    initialState,
  );
  const [lastSuccess, setLastSuccess] = useState(state.success);

  if (state.success && state.success !== lastSuccess) {
    setLastSuccess(state.success);
    setOpen(false);
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" className="bg-white" onClick={() => setOpen(true)}>
        <Plus data-icon="inline-start" />
        Execução avulsa
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-[#FFFDF8] p-4">
      <form
        key={state.success ?? "create-one-off"}
        action={formAction}
        className="space-y-3"
      >
        <input type="hidden" name="userGroupId" value={userGroupId} />
        <input
          type="hidden"
          name="maintenanceGroupId"
          value={maintenanceGroupId}
        />
        <input type="hidden" name="serviceId" value={serviceId} />

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
          <Label htmlFor="one-off-due-date">Data de vencimento</Label>
          <Input
            id="one-off-due-date"
            name="dueDate"
            type="date"
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="one-off-notes">Observações</Label>
          <Input
            id="one-off-notes"
            name="notes"
            placeholder="Motivo ou detalhes"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="bg-white"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Criando..." : "Criar execução"}
          </Button>
        </div>
      </form>
    </div>
  );
}
