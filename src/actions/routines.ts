"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/types";
import { translateDomainError } from "@/lib/errors/domain";
import { createClient } from "@/lib/supabase/server";
import {
  createRoutineSchema,
  deleteRoutineSchema,
  recalculateRoutineSchema,
  updateRoutineSchema,
} from "@/lib/validation/routines";
import type { Enums } from "@/types/database";

function parseWeekdays(value?: string) {
  if (!value || value.trim() === "") return undefined;
  const days = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
  return days.length > 0 ? days : undefined;
}

function parseMonthDay(value?: string) {
  if (!value || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 31 ? n : undefined;
}

function servicePath(
  userGroupId: string,
  maintenanceGroupId: string,
  serviceId: string,
) {
  return `/groups/${userGroupId}/maintenance/${maintenanceGroupId}/services/${serviceId}`;
}

export async function createRoutineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createRoutineSchema.safeParse({
    serviceId: formData.get("serviceId"),
    userGroupId: formData.get("userGroupId"),
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    frequency: formData.get("frequency"),
    intervalValue: formData.get("intervalValue"),
    baseDate: formData.get("baseDate"),
    endDate: formData.get("endDate") || undefined,
    weekdays: formData.get("weekdays") || undefined,
    monthDay: formData.get("monthDay") || undefined,
    isActive: formData.get("isActive") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar autenticado" };

  const { error } = await supabase.rpc("create_service_routine", {
    p_service_id: parsed.data.serviceId,
    p_frequency: parsed.data.frequency as Enums<"routine_frequency">,
    p_interval_value: parsed.data.intervalValue,
    p_base_date: parsed.data.baseDate,
    p_end_date:
      parsed.data.endDate && parsed.data.endDate !== ""
        ? parsed.data.endDate
        : undefined,
    p_weekdays: parseWeekdays(parsed.data.weekdays),
    p_month_day: parseMonthDay(parsed.data.monthDay),
    p_is_active: parsed.data.isActive !== "false",
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
  return { success: "Rotina criada e execuções geradas." };
}

export async function updateRoutineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updateRoutineSchema.safeParse({
    routineId: formData.get("routineId"),
    serviceId: formData.get("serviceId"),
    userGroupId: formData.get("userGroupId"),
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    frequency: formData.get("frequency"),
    intervalValue: formData.get("intervalValue"),
    baseDate: formData.get("baseDate"),
    endDate: formData.get("endDate") || undefined,
    weekdays: formData.get("weekdays") || undefined,
    monthDay: formData.get("monthDay") || undefined,
    isActive: formData.get("isActive") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar autenticado" };

  const { error } = await supabase.rpc("update_service_routine", {
    p_routine_id: parsed.data.routineId,
    p_frequency: parsed.data.frequency as Enums<"routine_frequency">,
    p_interval_value: parsed.data.intervalValue,
    p_base_date: parsed.data.baseDate,
    p_end_date:
      parsed.data.endDate && parsed.data.endDate !== ""
        ? parsed.data.endDate
        : undefined,
    p_weekdays: parseWeekdays(parsed.data.weekdays),
    p_month_day: parseMonthDay(parsed.data.monthDay),
    p_is_active: parsed.data.isActive !== "false",
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
  return { success: "Rotina atualizada e execuções recalculadas." };
}

export async function deleteRoutineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = deleteRoutineSchema.safeParse({
    routineId: formData.get("routineId"),
    userGroupId: formData.get("userGroupId"),
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    serviceId: formData.get("serviceId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar autenticado" };

  const { error } = await supabase.rpc("delete_service_routine", {
    p_routine_id: parsed.data.routineId,
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
  return { success: "Rotina excluída." };
}

export async function recalculateRoutineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = recalculateRoutineSchema.safeParse({
    routineId: formData.get("routineId"),
    userGroupId: formData.get("userGroupId"),
    maintenanceGroupId: formData.get("maintenanceGroupId"),
    serviceId: formData.get("serviceId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar autenticado" };

  const { data, error } = await supabase.rpc("recalculate_future_executions", {
    p_routine_id: parsed.data.routineId,
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
  return {
    success: `Recálculo concluído (${data ?? 0} execuções futuras).`,
  };
}
