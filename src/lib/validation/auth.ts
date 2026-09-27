import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, "O nome de exibição é obrigatório"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const createUserGroupSchema = z.object({
  name: z.string().trim().min(2, "O nome do grupo é obrigatório"),
  description: z.string().trim().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserGroupInput = z.infer<typeof createUserGroupSchema>;
