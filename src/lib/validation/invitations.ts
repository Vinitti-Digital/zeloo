import { z } from "zod";

export const createInvitationSchema = z.object({
  userGroupId: z.string().uuid("Grupo inválido"),
  email: z.string().trim().email("Informe um e-mail válido"),
});

export const invitationIdSchema = z.object({
  invitationId: z.string().uuid("Convite inválido"),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
