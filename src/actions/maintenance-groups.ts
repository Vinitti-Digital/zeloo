"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/types";
import { translateDomainError } from "@/lib/errors/domain";
import { createClient } from "@/lib/supabase/server";
import {
  createMaintenanceGroupSchema,
  deleteMaintenanceGroupSchema,
  updateMaintenanceGroupSchema,
} from "@/lib/validation/maintenance-groups";

export async function createMaintenanceGroupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createMaintenanceGroupSchema.safeParse({
    userGroupId: formData.get("userGroupId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Você precisa estar autenticado" };
  }

  const { error } = await supabase.rpc("create_maintenance_group", {
    p_user_group_id: parsed.data.userGroupId,
    p_name: parsed.data.name,
    p_description: parsed.data.description,
  });

  if (error) {
    return { error: translateDomainError(error.message) };
  }

  revalidatePath(`/groups/${parsed.data.userGroupId}`);
  return { success: "Grupo de manutenção criado." };
}

export async function updateMaintenanceGroupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updateMaintenanceGroupSchema.safeParse({
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    userGroupId: formData.get("userGroupId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Você precisa estar autenticado" };
  }

  const { error } = await supabase.rpc("update_maintenance_group", {
    p_maintenance_group_id: parsed.data.maintenanceGroupId,
    p_name: parsed.data.name,
    p_description: parsed.data.description,
  });

  if (error) {
    return { error: translateDomainError(error.message) };
  }

  revalidatePath(`/groups/${parsed.data.userGroupId}`);
  return { success: "Grupo de manutenção atualizado." };
}

export async function deleteMaintenanceGroupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = deleteMaintenanceGroupSchema.safeParse({
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    userGroupId: formData.get("userGroupId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Você precisa estar autenticado" };
  }

  const { error } = await supabase.rpc("delete_maintenance_group", {
    p_maintenance_group_id: parsed.data.maintenanceGroupId,
  });

  if (error) {
    return { error: translateDomainError(error.message) };
  }

  revalidatePath(`/groups/${parsed.data.userGroupId}`);
  return { success: "Grupo de manutenção excluído." };
}
