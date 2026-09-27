import { z } from "zod";

const frequencySchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

export const createRoutineSchema = z.object({
  serviceId: z.string().uuid("Serviço inválido"),
  userGroupId: z.string().uuid("Grupo inválido"),
  maintenanceGroupId: z.string().uuid("Grupo de manutenção inválido"),
  frequency: frequencySchema,
  intervalValue: z.coerce.number().int().min(1, "Intervalo mínimo é 1"),
  baseDate: z.string().min(1, "Informe a data base"),
  endDate: z.string().optional().or(z.literal("")),
  weekdays: z.string().optional().or(z.literal("")),
  monthDay: z.string().optional().or(z.literal("")),
  isActive: z.enum(["true", "false"]).optional(),
});

export const updateRoutineSchema = createRoutineSchema.extend({
  routineId: z.string().uuid("Rotina inválida"),
});

export const deleteRoutineSchema = z.object({
  routineId: z.string().uuid("Rotina inválida"),
  userGroupId: z.string().uuid("Grupo inválido"),
  maintenanceGroupId: z.string().uuid("Grupo de manutenção inválido"),
  serviceId: z.string().uuid("Serviço inválido"),
});

export const recalculateRoutineSchema = z.object({
  routineId: z.string().uuid("Rotina inválida"),
  userGroupId: z.string().uuid("Grupo inválido"),
  maintenanceGroupId: z.string().uuid("Grupo de manutenção inválido"),
  serviceId: z.string().uuid("Serviço inválido"),
});
