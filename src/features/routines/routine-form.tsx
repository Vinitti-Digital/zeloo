"use client";

import { useActionState, useState } from "react";

import {
  createRoutineAction,
  deleteRoutineAction,
  recalculateRoutineAction,
  updateRoutineAction,
} from "@/actions/routines";
import type { ActionState } from "@/lib/actions/types";
import {
  formatDateOnly,
  formatRoutineFrequency,
} from "@/lib/i18n/labels";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

const selectClassName =
  "h-11 w-full min-w-0 rounded-xl border border-input bg-white px-3.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

const FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const;

type RoutineData = {
  id: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval_value: number;
  base_date: string;
  end_date: string | null;
  weekdays: number[] | null;
  month_day: number | null;
  is_active: boolean;
};

type RoutineFormProps = {
  mode: "create" | "edit";
  userGroupId: string;
  maintenanceGroupId: string;
  serviceId: string;
  routine?: RoutineData;
  previewDate?: string | null;
  canDelete?: boolean;
};

export function RoutineForm({
  mode,
  userGroupId,
  maintenanceGroupId,
  serviceId,
  routine,
  previewDate,
  canDelete = false,
}: RoutineFormProps) {
  const action = mode === "create" ? createRoutineAction : updateRoutineAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [recalcState, recalcAction, recalcPending] = useActionState(
    recalculateRoutineAction,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteRoutineAction,
    initialState,
  );
  const [frequency, setFrequency] = useState<
    "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  >(routine?.frequency ?? "MONTHLY");

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-white/85 p-5 sm:p-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
          Rotina
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "create"
            ? "Defina a recorrência para gerar execuções automaticamente."
            : "Ajuste a recorrência e recalcule as próximas execuções."}
        </p>
        {previewDate ? (
          <p className="mt-2 text-sm font-medium text-primary">
            Próxima ocorrência prevista: {formatDateOnly(previewDate)}
          </p>
        ) : null}
      </div>

      <form
        key={state.success ?? `routine-${mode}-${routine?.id ?? "new"}`}
        action={formAction}
        className="space-y-3"
      >
        {mode === "edit" && routine ? (
          <input type="hidden" name="routineId" value={routine.id} />
        ) : null}
        <input type="hidden" name="serviceId" value={serviceId} />
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
        {state.success ? (
          <Alert>
            <AlertDescription>{state.success}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="routine-frequency">Frequência</Label>
            <select
              id="routine-frequency"
              name="frequency"
              className={selectClassName}
              value={frequency}
              onChange={(event) =>
                setFrequency(
                  event.target.value as
                    | "DAILY"
                    | "WEEKLY"
                    | "MONTHLY"
                    | "YEARLY",
                )
              }
              required
            >
              {FREQUENCIES.map((value) => (
                <option key={value} value={value}>
                  {formatRoutineFrequency(value)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="routine-interval">Intervalo</Label>
            <Input
              id="routine-interval"
              name="intervalValue"
              type="number"
              min={1}
              step={1}
              defaultValue={routine?.interval_value ?? 1}
              required
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="routine-base-date">Data base</Label>
            <Input
              id="routine-base-date"
              name="baseDate"
              type="date"
              defaultValue={routine?.base_date ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routine-end-date">Data final (opcional)</Label>
            <Input
              id="routine-end-date"
              name="endDate"
              type="date"
              defaultValue={routine?.end_date ?? ""}
            />
          </div>
        </div>

        {frequency === "WEEKLY" ? (
          <div className="space-y-2">
            <Label htmlFor="routine-weekdays">
              Dias da semana (0–6, separados por vírgula)
            </Label>
            <Input
              id="routine-weekdays"
              name="weekdays"
              placeholder="Ex.: 1,3,5"
              defaultValue={routine?.weekdays?.join(",") ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              0 = domingo, 6 = sábado
            </p>
          </div>
        ) : null}

        {frequency === "MONTHLY" ? (
          <div className="space-y-2">
            <Label htmlFor="routine-month-day">Dia do mês</Label>
            <Input
              id="routine-month-day"
              name="monthDay"
              type="number"
              min={1}
              max={31}
              defaultValue={routine?.month_day ?? ""}
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="routine-active">Ativa</Label>
          <select
            id="routine-active"
            name="isActive"
            className={selectClassName}
            defaultValue={routine?.is_active === false ? "false" : "true"}
          >
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending
              ? "Salvando..."
              : mode === "create"
                ? "Criar rotina"
                : "Salvar rotina"}
          </Button>
        </div>
      </form>

      {mode === "edit" && routine ? (
        <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:flex-wrap">
          <form action={recalcAction}>
            <input type="hidden" name="routineId" value={routine.id} />
            <input type="hidden" name="serviceId" value={serviceId} />
            <input type="hidden" name="userGroupId" value={userGroupId} />
            <input
              type="hidden"
              name="maintenanceGroupId"
              value={maintenanceGroupId}
            />
            <Button
              type="submit"
              variant="outline"
              className="bg-white"
              disabled={recalcPending}
            >
              {recalcPending ? "Recalculando..." : "Recalcular execuções"}
            </Button>
          </form>

          {canDelete ? (
            <form action={deleteAction}>
              <input type="hidden" name="routineId" value={routine.id} />
              <input type="hidden" name="serviceId" value={serviceId} />
              <input type="hidden" name="userGroupId" value={userGroupId} />
              <input
                type="hidden"
                name="maintenanceGroupId"
                value={maintenanceGroupId}
              />
              <Button
                type="submit"
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                disabled={deletePending}
              >
                {deletePending ? "Excluindo..." : "Excluir rotina"}
              </Button>
            </form>
          ) : null}

          {recalcState.error || deleteState.error ? (
            <Alert variant="destructive" className="w-full basis-full">
              <AlertDescription>
                {recalcState.error ?? deleteState.error}
              </AlertDescription>
            </Alert>
          ) : null}
          {recalcState.success || deleteState.success ? (
            <Alert className="w-full basis-full">
              <AlertDescription>
                {recalcState.success ?? deleteState.success}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
