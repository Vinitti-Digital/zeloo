import { z } from "zod";

const pathIds = {
  userGroupId: z.string().uuid("Grupo inválido"),
  maintenanceGroupId: z.string().uuid("Grupo de manutenção inválido"),
  serviceId: z.string().uuid("Serviço inválido"),
  executionId: z.string().uuid("Execução inválida"),
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
