"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";

import { createServiceAction } from "@/actions/services";
import type { ActionState } from "@/lib/actions/types";
import { formatServicePriority } from "@/lib/i18n/labels";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

const selectClassName =
  "h-11 w-full min-w-0 rounded-xl border border-input bg-white px-3.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

type MemberOption = {
  id: string;
  display_name: string;
};

type CreateServiceFormProps = {
  userGroupId: string;
  maintenanceGroupId: string;
  members: MemberOption[];
};

export function CreateServiceForm({
  userGroupId,
  maintenanceGroupId,
  members,
}: CreateServiceFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createServiceAction,
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
        Nova tarefa
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-[#FFFDF8] p-4">
      <form
        key={state.success ?? "create-service"}
        action={formAction}
        className="space-y-3"
      >
        <input type="hidden" name="userGroupId" value={userGroupId} />
        <input
          type="hidden"
          name="maintenanceGroupId"
          value={maintenanceGroupId}
        />

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="service-title">Título</Label>
          <Input
            id="service-title"
            name="title"
            placeholder="Ex.: Troca de filtro, Limpeza da caixa d'água"
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-description">Descrição (opcional)</Label>
          <Input
            id="service-description"
            name="description"
            placeholder="Detalhes da tarefa"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="service-priority">Prioridade</Label>
            <select
              id="service-priority"
              name="priority"
              className={selectClassName}
              defaultValue=""
            >
              <option value="">Sem prioridade</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {formatServicePriority(priority)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-responsible">Responsável</Label>
            <select
              id="service-responsible"
              name="responsibleUserId"
              className={selectClassName}
              defaultValue=""
            >
              <option value="">Ninguém atribuído</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="service-location">Local</Label>
            <Input
              id="service-location"
              name="location"
              placeholder="Ex.: Quintal, Sala técnica"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-cost">Custo estimado</Label>
            <Input
              id="service-cost"
              name="estimatedCost"
              inputMode="decimal"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-notes">Observações</Label>
          <Input
            id="service-notes"
            name="notes"
            placeholder="Anotações adicionais"
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
            {pending ? "Criando..." : "Criar tarefa"}
          </Button>
        </div>
      </form>
    </div>
  );
}
