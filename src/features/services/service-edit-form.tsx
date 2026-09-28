"use client";

import { useActionState } from "react";

import {
  deleteServiceAction,
  updateServiceAction,
} from "@/actions/services";
import type { ActionState } from "@/lib/actions/types";
import {
  formatServicePriority,
  formatServiceStatus,
} from "@/lib/i18n/labels";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

const selectClassName =
  "h-11 w-full min-w-0 rounded-xl border border-input bg-white px-3.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const STATUSES = ["ACTIVE", "COMPLETED"] as const;

type MemberOption = {
  id: string;
  display_name: string;
};

type ServiceEditFormProps = {
  userGroupId: string;
  maintenanceGroupId: string;
  service: {
    id: string;
    title: string;
    description: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null;
    responsible_user_id: string | null;
    location: string | null;
    estimated_cost: number | null;
    notes: string | null;
    status: "ACTIVE" | "COMPLETED";
  };
  members: MemberOption[];
  canDelete: boolean;
};

export function ServiceEditForm({
  userGroupId,
  maintenanceGroupId,
  service,
  members,
  canDelete,
}: ServiceEditFormProps) {
  const [updateState, updateAction, updatePending] = useActionState(
    updateServiceAction,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteServiceAction,
    initialState,
  );

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-white/85 p-5 sm:p-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
          Tarefa
        </h2>
        <p className="text-sm text-muted-foreground">
          Edite os dados desta tarefa.
        </p>
      </div>

      <form
        key={updateState.success ?? `edit-service-${service.id}`}
        action={updateAction}
        className="space-y-3"
      >
        <input type="hidden" name="serviceId" value={service.id} />
        <input type="hidden" name="userGroupId" value={userGroupId} />
        <input
          type="hidden"
          name="maintenanceGroupId"
          value={maintenanceGroupId}
        />

        {updateState.error ? (
          <Alert variant="destructive">
            <AlertDescription>{updateState.error}</AlertDescription>
          </Alert>
        ) : null}
        {updateState.success ? (
          <Alert>
            <AlertDescription>{updateState.success}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor={`service-edit-title-${service.id}`}>Título</Label>
          <Input
            id={`service-edit-title-${service.id}`}
            name="title"
            defaultValue={service.title}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`service-edit-desc-${service.id}`}>Descrição</Label>
          <Input
            id={`service-edit-desc-${service.id}`}
            name="description"
            defaultValue={service.description ?? ""}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`service-edit-priority-${service.id}`}>
              Prioridade
            </Label>
            <select
              id={`service-edit-priority-${service.id}`}
              name="priority"
              className={selectClassName}
              defaultValue={service.priority ?? ""}
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
            <Label htmlFor={`service-edit-status-${service.id}`}>Status</Label>
            <select
              id={`service-edit-status-${service.id}`}
              name="status"
              className={selectClassName}
              defaultValue={service.status}
              required
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatServiceStatus(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`service-edit-responsible-${service.id}`}>
              Responsável
            </Label>
            <select
              id={`service-edit-responsible-${service.id}`}
              name="responsibleUserId"
              className={selectClassName}
              defaultValue={service.responsible_user_id ?? ""}
            >
              <option value="">Ninguém atribuído</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.display_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`service-edit-location-${service.id}`}>Local</Label>
            <Input
              id={`service-edit-location-${service.id}`}
              name="location"
              defaultValue={service.location ?? ""}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`service-edit-cost-${service.id}`}>
              Custo estimado
            </Label>
            <Input
              id={`service-edit-cost-${service.id}`}
              name="estimatedCost"
              inputMode="decimal"
              defaultValue={
                service.estimated_cost != null
                  ? String(service.estimated_cost)
                  : ""
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`service-edit-notes-${service.id}`}>
              Observações
            </Label>
            <Input
              id={`service-edit-notes-${service.id}`}
              name="notes"
              defaultValue={service.notes ?? ""}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={updatePending}>
            {updatePending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>

      {canDelete ? (
        <form action={deleteAction} className="border-t border-border/70 pt-4">
          <input type="hidden" name="serviceId" value={service.id} />
          <input type="hidden" name="userGroupId" value={userGroupId} />
          <input
            type="hidden"
            name="maintenanceGroupId"
            value={maintenanceGroupId}
          />
          {deleteState.error ? (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription>{deleteState.error}</AlertDescription>
            </Alert>
          ) : null}
          <Button
            type="submit"
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
            disabled={deletePending}
          >
            {deletePending ? "Excluindo..." : "Excluir tarefa"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
