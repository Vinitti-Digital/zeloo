"use client";

import { useActionState, useState } from "react";

import {
  cancelExecutionAction,
  completeExecutionAction,
  rescheduleExecutionAction,
} from "@/actions/executions";
import type { ActionState } from "@/lib/actions/types";
import {
  formatDateOnly,
  formatExecutionStatus,
} from "@/lib/i18n/labels";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

type ExecutionData = {
  id: string;
  scheduled_date: string;
  due_date: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  completed_by_display_name: string | null;
  cancel_reason: string | null;
};

type ExecutionItemProps = {
  execution: ExecutionData;
  userGroupId: string;
  maintenanceGroupId: string;
  serviceId: string;
};

type PendingAction = "complete" | "reschedule" | "cancel" | null;

function statusVariant(
  status: ExecutionData["status"],
): "default" | "secondary" | "outline" {
  switch (status) {
    case "PENDING":
      return "default";
    case "COMPLETED":
      return "secondary";
    case "CANCELLED":
      return "outline";
  }
}

export function ExecutionItem({
  execution,
  userGroupId,
  maintenanceGroupId,
  serviceId,
}: ExecutionItemProps) {
  const [action, setAction] = useState<PendingAction>(null);
  const [completeState, completeFormAction, completePending] = useActionState(
    completeExecutionAction,
    initialState,
  );
  const [rescheduleState, rescheduleFormAction, reschedulePending] =
    useActionState(rescheduleExecutionAction, initialState);
  const [cancelState, cancelFormAction, cancelPending] = useActionState(
    cancelExecutionAction,
    initialState,
  );

  const pathFields = (
    <>
      <input type="hidden" name="executionId" value={execution.id} />
      <input type="hidden" name="userGroupId" value={userGroupId} />
      <input
        type="hidden"
        name="maintenanceGroupId"
        value={maintenanceGroupId}
      />
      <input type="hidden" name="serviceId" value={serviceId} />
    </>
  );

  const feedback =
    completeState.error ||
    completeState.success ||
    rescheduleState.error ||
    rescheduleState.success ||
    cancelState.error ||
    cancelState.success;

  return (
    <div className="space-y-3 px-4 py-3.5 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">
              Vence em {formatDateOnly(execution.due_date)}
            </p>
            <Badge variant={statusVariant(execution.status)}>
              {formatExecutionStatus(execution.status)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Agendada para {formatDateOnly(execution.scheduled_date)}
          </p>
          {execution.notes ? (
            <p className="text-sm text-muted-foreground">{execution.notes}</p>
          ) : null}
          {execution.status === "COMPLETED" &&
          execution.completed_by_display_name ? (
            <p className="text-xs text-muted-foreground">
              Concluída por {execution.completed_by_display_name}
            </p>
          ) : null}
          {execution.status === "CANCELLED" && execution.cancel_reason ? (
            <p className="text-xs text-muted-foreground">
              Motivo: {execution.cancel_reason}
            </p>
          ) : null}
        </div>

        {execution.status === "PENDING" ? (
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              onClick={() =>
                setAction(action === "complete" ? null : "complete")
              }
            >
              Concluir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="bg-white"
              onClick={() =>
                setAction(action === "reschedule" ? null : "reschedule")
              }
            >
              Reagendar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-destructive/30 bg-white text-destructive hover:bg-destructive/10"
              onClick={() => setAction(action === "cancel" ? null : "cancel")}
            >
              Cancelar
            </Button>
          </div>
        ) : null}
      </div>

      {feedback ? (
        <Alert
          variant={
            completeState.error || rescheduleState.error || cancelState.error
              ? "destructive"
              : "default"
          }
        >
          <AlertDescription>
            {completeState.error ||
              completeState.success ||
              rescheduleState.error ||
              rescheduleState.success ||
              cancelState.error ||
              cancelState.success}
          </AlertDescription>
        </Alert>
      ) : null}

      {execution.status === "PENDING" && action === "complete" ? (
        <form
          key={completeState.success ?? `complete-${execution.id}`}
          action={completeFormAction}
          className="space-y-3 rounded-2xl border border-border bg-[#FFFDF8] p-3"
        >
          {pathFields}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`complete-cost-${execution.id}`}>
                Custo real
              </Label>
              <Input
                id={`complete-cost-${execution.id}`}
                name="actualCost"
                inputMode="decimal"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`complete-notes-${execution.id}`}>
                Observações
              </Label>
              <Input
                id={`complete-notes-${execution.id}`}
                name="notes"
                defaultValue={execution.notes ?? ""}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-white"
              onClick={() => setAction(null)}
              disabled={completePending}
            >
              Fechar
            </Button>
            <Button type="submit" disabled={completePending}>
              {completePending ? "Concluindo..." : "Confirmar conclusão"}
            </Button>
          </div>
        </form>
      ) : null}

      {execution.status === "PENDING" && action === "reschedule" ? (
        <form
          key={rescheduleState.success ?? `reschedule-${execution.id}`}
          action={rescheduleFormAction}
          className="space-y-3 rounded-2xl border border-border bg-[#FFFDF8] p-3"
        >
          {pathFields}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`reschedule-date-${execution.id}`}>
                Nova data
              </Label>
              <Input
                id={`reschedule-date-${execution.id}`}
                name="newDueDate"
                type="date"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`reschedule-reason-${execution.id}`}>
                Motivo
              </Label>
              <Input
                id={`reschedule-reason-${execution.id}`}
                name="reason"
                placeholder="Por que reagendar?"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-white"
              onClick={() => setAction(null)}
              disabled={reschedulePending}
            >
              Fechar
            </Button>
            <Button type="submit" disabled={reschedulePending}>
              {reschedulePending ? "Reagendando..." : "Confirmar reagendamento"}
            </Button>
          </div>
        </form>
      ) : null}

      {execution.status === "PENDING" && action === "cancel" ? (
        <form
          key={cancelState.success ?? `cancel-${execution.id}`}
          action={cancelFormAction}
          className="space-y-3 rounded-2xl border border-border bg-[#FFFDF8] p-3"
        >
          {pathFields}
          <div className="space-y-2">
            <Label htmlFor={`cancel-reason-${execution.id}`}>Motivo</Label>
            <Input
              id={`cancel-reason-${execution.id}`}
              name="reason"
              placeholder="Por que cancelar?"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-white"
              onClick={() => setAction(null)}
              disabled={cancelPending}
            >
              Fechar
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              disabled={cancelPending}
            >
              {cancelPending ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
