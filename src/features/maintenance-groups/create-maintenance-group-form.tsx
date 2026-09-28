"use client";

import { useActionState, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { createMaintenanceGroupAction } from "@/actions/maintenance-groups";
import type { ActionState } from "@/lib/actions/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

type CreateMaintenanceGroupFormProps = {
  userGroupId: string;
};

export function CreateMaintenanceGroupForm({
  userGroupId,
}: CreateMaintenanceGroupFormProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createMaintenanceGroupAction,
    initialState,
  );
  const [lastSuccess, setLastSuccess] = useState(state.success);

  if (state.success && state.success !== lastSuccess) {
    setLastSuccess(state.success);
    setOpen(false);
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus data-icon="inline-start" />
        Novo espaço
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-[#FFFDF8] p-4">
      <form
        ref={formRef}
        key={state.success ?? "create-mg"}
        action={formAction}
        className="space-y-3"
      >
        <input type="hidden" name="userGroupId" value={userGroupId} />

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="mg-name">Nome</Label>
          <Input
            id="mg-name"
            name="name"
            placeholder="Ex.: Área externa, Cozinha, Escritório"
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mg-description">Descrição (opcional)</Label>
          <Input
            id="mg-description"
            name="description"
            placeholder="O que este espaço cobre"
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
            {pending ? "Criando..." : "Criar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
