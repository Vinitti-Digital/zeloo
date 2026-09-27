import { z } from "zod";

export const createMaintenanceGroupSchema = z.object({
  userGroupId: z.string().uuid("Grupo inválido"),
  name: z.string().trim().min(2, "O nome do grupo de manutenção é obrigatório"),
  description: z.string().trim().optional(),
});

export const updateMaintenanceGroupSchema = z.object({
  maintenanceGroupId: z.string().uuid("Grupo de manutenção inválido"),
  userGroupId: z.string().uuid("Grupo inválido"),
  name: z.string().trim().min(2, "O nome do grupo de manutenção é obrigatório"),
  description: z.string().trim().optional(),
});

export const deleteMaintenanceGroupSchema = z.object({
  maintenanceGroupId: z.string().uuid("Grupo de manutenção inválido"),
  userGroupId: z.string().uuid("Grupo inválido"),
});

export type CreateMaintenanceGroupInput = z.infer<
  typeof createMaintenanceGroupSchema
>;
