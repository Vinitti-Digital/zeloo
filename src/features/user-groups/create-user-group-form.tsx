"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";

import { createUserGroupAction, type ActionState } from "@/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

type CreateUserGroupFormProps = {
  defaultOpen?: boolean;
};

export function CreateUserGroupForm({
  defaultOpen = false,
}: CreateUserGroupFormProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [state, formAction, pending] = useActionState(
    createUserGroupAction,
    initialState,
  );

  if (!open) {
    return (
      <Button
        type="button"
        size="lg"
        className="w-full sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <Plus data-icon="inline-start" />
        Criar novo grupo
      </Button>
    );
  }

  return (
    <div className="animate-fade-up rounded-3xl border border-border bg-white/90 p-5 shadow-[0_12px_36px_rgba(43,22,12,0.06)] sm:p-6">
      <div className="mb-5 space-y-1.5">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
          Novo grupo
        </h2>
        <p className="text-sm text-muted-foreground">
          Você entra como Proprietário. Depois pode convidar outras pessoas.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="name">Nome do grupo</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ex.: Casa Mateus & Micka"
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Input
            id="description"
            name="description"
            placeholder="Ex.: Apartamento, escritório, casa dos pais"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {!defaultOpen ? (
            <Button
              type="button"
              variant="outline"
              className="bg-white"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Criando..." : "Criar grupo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
