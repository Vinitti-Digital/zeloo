"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/lib/actions/types";
import { translateDomainError } from "@/lib/errors/domain";
import { createClient } from "@/lib/supabase/server";
import {
  createOneOffExecutionSchema,
  createServiceSchema,
  deleteServiceSchema,
  updateServiceSchema,
} from "@/lib/validation/services";
import type { Enums } from "@/types/database";

function servicePath(
  userGroupId: string,
  maintenanceGroupId: string,
  serviceId?: string,
) {
  const base = `/groups/${userGroupId}/maintenance/${maintenanceGroupId}`;
  return serviceId ? `${base}/services/${serviceId}` : base;
}

function parseOptionalCost(value?: string) {
  if (!value || value.trim() === "") return undefined;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export async function createServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createServiceSchema.safeParse({
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    userGroupId: formData.get("userGroupId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priority: formData.get("priority") || undefined,
    responsibleUserId: formData.get("responsibleUserId") || undefined,
    location: formData.get("location") || undefined,
    estimatedCost: formData.get("estimatedCost") || undefined,
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

  const priority =
    parsed.data.priority
      ? (parsed.data.priority as Enums<"service_priority">)
      : undefined;

  const { data, error } = await supabase.rpc("create_service", {
    p_maintenance_group_id: parsed.data.maintenanceGroupId,
    p_title: parsed.data.title,
    p_description: parsed.data.description,
    p_priority: priority,
    p_responsible_user_id:
      parsed.data.responsibleUserId && parsed.data.responsibleUserId !== ""
        ? parsed.data.responsibleUserId
        : undefined,
    p_location: parsed.data.location,
    p_estimated_cost: parseOptionalCost(parsed.data.estimatedCost),
    p_notes: parsed.data.notes,
  });

  if (error || !data) {
    return {
      error: translateDomainError(
        error?.message ?? "Não foi possível criar o serviço",
      ),
    };
  }

  revalidatePath(
    servicePath(parsed.data.userGroupId, parsed.data.maintenanceGroupId),
  );
  redirect(
    servicePath(
      parsed.data.userGroupId,
      parsed.data.maintenanceGroupId,
      data.id,
    ),
  );
}

export async function updateServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updateServiceSchema.safeParse({
    serviceId: formData.get("serviceId"),
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    userGroupId: formData.get("userGroupId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priority: formData.get("priority") || undefined,
    responsibleUserId: formData.get("responsibleUserId") || undefined,
    location: formData.get("location") || undefined,
    estimatedCost: formData.get("estimatedCost") || undefined,
    notes: formData.get("notes") || undefined,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar autenticado" };

  const priority =
    parsed.data.priority
      ? (parsed.data.priority as Enums<"service_priority">)
      : undefined;

  const { error } = await supabase.rpc("update_service", {
    p_service_id: parsed.data.serviceId,
    p_title: parsed.data.title,
    p_description: parsed.data.description,
    p_priority: priority,
    p_responsible_user_id:
      parsed.data.responsibleUserId && parsed.data.responsibleUserId !== ""
        ? parsed.data.responsibleUserId
        : undefined,
    p_location: parsed.data.location,
    p_estimated_cost: parseOptionalCost(parsed.data.estimatedCost),
    p_notes: parsed.data.notes,
    p_status: parsed.data.status,
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
  return { success: "Serviço atualizado." };
}

export async function deleteServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = deleteServiceSchema.safeParse({
    serviceId: formData.get("serviceId"),
    userGroupId: formData.get("userGroupId"),
    maintenanceGroupId: formData.get("maintenanceGroupId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar autenticado" };

  const { error } = await supabase.rpc("delete_service", {
    p_service_id: parsed.data.serviceId,
  });

  if (error) {
    return { error: translateDomainError(error.message) };
  }

  revalidatePath(
    servicePath(parsed.data.userGroupId, parsed.data.maintenanceGroupId),
  );
  redirect(
    servicePath(parsed.data.userGroupId, parsed.data.maintenanceGroupId),
  );
}

export async function createOneOffExecutionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createOneOffExecutionSchema.safeParse({
    serviceId: formData.get("serviceId"),
    userGroupId: formData.get("userGroupId"),
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    dueDate: formData.get("dueDate"),
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

  const { error } = await supabase.rpc("create_one_off_execution", {
    p_service_id: parsed.data.serviceId,
    p_due_date: parsed.data.dueDate,
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
  return { success: "Execução avulsa criada." };
}
