import { z } from "zod";

const pathIds = {
  userGroupId: z.string().uuid("Grupo inválido"),
  maintenanceGroupId: z.string().uuid("espaço inválido"),
  serviceId: z.string().uuid("Tarefa inválida"),
  executionId: z.string().uuid("Pendência inválida"),
};

export const completeExecutionSchema = z.object({
  ...pathIds,
  actualCost: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const cancelExecutionSchema = z.object({
  ...pathIds,
  reason: z.string().trim().optional(),
});

export const rescheduleExecutionSchema = z.object({
  ...pathIds,
  newDueDate: z.string().min(1, "Informe a nova data"),
  reason: z.string().trim().optional(),
});
