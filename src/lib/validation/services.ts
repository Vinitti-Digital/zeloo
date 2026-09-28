import { z } from "zod";

const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional();
const statusSchema = z.enum(["ACTIVE", "COMPLETED"]);

export const createServiceSchema = z.object({
  maintenanceGroupId: z.string().uuid("espaço inválido"),
  userGroupId: z.string().uuid("Grupo inválido"),
  title: z.string().trim().min(2, "O título da tarefa é obrigatório"),
  description: z.string().trim().optional(),
  priority: prioritySchema.or(z.literal("")),
  responsibleUserId: z
    .string()
    .uuid("Responsável inválido")
    .optional()
    .or(z.literal("")),
  location: z.string().trim().optional(),
  estimatedCost: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const updateServiceSchema = createServiceSchema.extend({
  serviceId: z.string().uuid("Tarefa inválida"),
  status: statusSchema,
});

export const deleteServiceSchema = z.object({
  serviceId: z.string().uuid("Tarefa inválida"),
  userGroupId: z.string().uuid("Grupo inválido"),
  maintenanceGroupId: z.string().uuid("espaço inválido"),
});

export const createOneOffExecutionSchema = z.object({
  serviceId: z.string().uuid("Tarefa inválida"),
  userGroupId: z.string().uuid("Grupo inválido"),
  maintenanceGroupId: z.string().uuid("espaço inválido"),
  dueDate: z.string().min(1, "Informe a data"),
  notes: z.string().trim().optional(),
});
