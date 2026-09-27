"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/types";
import { translateDomainError } from "@/lib/errors/domain";
import { createClient } from "@/lib/supabase/server";
import {
  cancelExecutionSchema,
  completeExecutionSchema,
  rescheduleExecutionSchema,
} from "@/lib/validation/executions";

function servicePath(
  userGroupId: string,
  maintenanceGroupId: string,
  serviceId: string,
) {
  return `/groups/${userGroupId}/maintenance/${maintenanceGroupId}/services/${serviceId}`;
}

function parseOptionalCost(value?: string) {
  if (!value || value.trim() === "") return undefined;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export async function completeExecutionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = completeExecutionSchema.safeParse({
    executionId: formData.get("executionId"),
    userGroupId: formData.get("userGroupId"),
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    serviceId: formData.get("serviceId"),
    actualCost: formData.get("actualCost") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar autenticado" };

  const { error } = await supabase.rpc("complete_execution", {
    p_execution_id: parsed.data.executionId,
    p_actual_cost: parseOptionalCost(parsed.data.actualCost),
    p_notes: parsed.data.notes,
  });

  if (error) {
    return { error: translateDomainError(error.message) };
  }

  revalidatePath(
    servicePath(
      parsed.data.userGroupId,
      parsed.data.maintenanceGroupId,
      parsed.data.serviceId,
    ),
  );
  return { success: "Execução concluída." };
}

export async function cancelExecutionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = cancelExecutionSchema.safeParse({
    executionId: formData.get("executionId"),
    userGroupId: formData.get("userGroupId"),
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    serviceId: formData.get("serviceId"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar autenticado" };

  const { error } = await supabase.rpc("cancel_execution", {
    p_execution_id: parsed.data.executionId,
    p_reason: parsed.data.reason,
  });

  if (error) {
    return { error: translateDomainError(error.message) };
  }

  revalidatePath(
    servicePath(
      parsed.data.userGroupId,
      parsed.data.maintenanceGroupId,
      parsed.data.serviceId,
    ),
  );
  return { success: "Execução cancelada." };
}

export async function rescheduleExecutionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = rescheduleExecutionSchema.safeParse({
    executionId: formData.get("executionId"),
    userGroupId: formData.get("userGroupId"),
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    serviceId: formData.get("serviceId"),
    newDueDate: formData.get("newDueDate"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar autenticado" };

  const { error } = await supabase.rpc("reschedule_execution", {
    p_execution_id: parsed.data.executionId,
    p_new_due_date: parsed.data.newDueDate,
    p_reason: parsed.data.reason,
  });

  if (error) {
    return { error: translateDomainError(error.message) };
  }

  revalidatePath(
    servicePath(
      parsed.data.userGroupId,
      parsed.data.maintenanceGroupId,
      parsed.data.serviceId,
    ),
  );
  return { success: "Execução reagendada." };
}
