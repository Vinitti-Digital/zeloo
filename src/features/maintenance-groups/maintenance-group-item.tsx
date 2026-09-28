"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";

import {
  deleteMaintenanceGroupAction,
  updateMaintenanceGroupAction,
} from "@/actions/maintenance-groups";
import type { ActionState } from "@/lib/actions/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

type MaintenanceGroupItemProps = {
  userGroupId: string;
  group: {
    id: string;
    name: string;
    description: string | null;
  };
  canDelete: boolean;
};

export function MaintenanceGroupItem({
  userGroupId,
  group,
  canDelete,
}: MaintenanceGroupItemProps) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updatePending] = useActionState(
    updateMaintenanceGroupAction,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteMaintenanceGroupAction,
    initialState,
  );
  const [lastSuccess, setLastSuccess] = useState(updateState.success);

  if (updateState.success && updateState.success !== lastSuccess) {
    setLastSuccess(updateState.success);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="space-y-3 px-4 py-3.5 sm:px-5">
        <form
          key={updateState.success ?? `edit-${group.id}`}
          action={updateAction}
          className="space-y-3"
        >
          <input type="hidden" name="maintenanceGroupId" value={group.id} />
          <input type="hidden" name="userGroupId" value={userGroupId} />

          {updateState.error ? (
            <Alert variant="destructive">
              <AlertDescription>{updateState.error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`mg-edit-name-${group.id}`}>Nome</Label>
            <Input
              id={`mg-edit-name-${group.id}`}
              name="name"
              defaultValue={group.name}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`mg-edit-desc-${group.id}`}>Descrição</Label>
            <Input
              id={`mg-edit-desc-${group.id}`}
              name="description"
              defaultValue={group.description ?? ""}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="bg-white"
              onClick={() => setEditing(false)}
              disabled={updatePending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updatePending}>
              {updatePending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const initial = group.name.trim().charAt(0).toUpperCase() || "M";

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3.5 sm:px-5">
      <Link
        href={`/groups/${userGroupId}/maintenance/${group.id}`}
        className="flex min-w-0 flex-1 items-start gap-3 rounded-xl transition-colors hover:bg-[#FFF8EA]/60"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1D2] font-[family-name:var(--font-display)] text-lg text-primary">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{group.name}</p>
          <p className="text-sm text-muted-foreground">
            {group.description || "Sem descrição"}
          </p>
          {deleteState.error ? (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{deleteState.error}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground" />
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Editar espaço"
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-4" />
        </Button>
        {canDelete ? (
          <form action={deleteAction}>
            <input type="hidden" name="maintenanceGroupId" value={group.id} />
            <input type="hidden" name="userGroupId" value={userGroupId} />
            <Button
              type="submit"
              size="icon-sm"
              variant="ghost"
              aria-label="Excluir espaço"
              disabled={deletePending}
            >
              <Trash2 className="size-4" />
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
