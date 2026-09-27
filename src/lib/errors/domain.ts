const DOMAIN_ERROR_MAP: Array<[RegExp | string, string]> = [
  ["Only OWNER can invite members", "Apenas o Proprietário pode convidar membros."],
  ["Valid email is required", "Informe um e-mail válido."],
  ["You cannot invite yourself", "Você não pode convidar a si mesmo."],
  [
    "This user is already an active member",
    "Esta pessoa já é membro ativo do grupo.",
  ],
  [
    "A pending invitation already exists for this email",
    "Já existe um convite pendente para este e-mail.",
  ],
  ["Invitation not found", "Convite não encontrado."],
  ["Invitation has expired", "Este convite expirou."],
  ["Invitation is not pending", "Este convite não está mais pendente."],
  [
    "Invitation email does not match your account",
    "Este convite não corresponde ao e-mail da sua conta.",
  ],
  [
    "You are already an active member of this group",
    "Você já é membro ativo deste grupo.",
  ],
  [
    "Not allowed to cancel this invitation",
    "Você não pode cancelar este convite.",
  ],
  ["Active membership required", "É necessário ser membro ativo do grupo."],
  [
    "Maintenance group name is required",
    "O nome do grupo de manutenção é obrigatório.",
  ],
  ["Maintenance group not found", "Grupo de manutenção não encontrado."],
  [
    "Only OWNER can delete maintenance groups",
    "Apenas o Proprietário pode excluir grupos de manutenção.",
  ],
  ["Not authenticated", "Você precisa estar autenticado."],
  ["Profile not found", "Perfil não encontrado."],
  ["Service title is required", "O título do serviço é obrigatório."],
  ["Service not found", "Serviço não encontrado."],
  [
    "Responsible user must be an active member",
    "O responsável precisa ser membro ativo do grupo.",
  ],
  [
    "Only OWNER can delete services",
    "Apenas o Proprietário pode excluir serviços.",
  ],
  ["Due date is required", "Informe a data da execução."],
  [
    "A pending execution already exists for this date",
    "Já existe uma execução pendente nesta data.",
  ],
  [
    "This service already has a routine",
    "Este serviço já possui uma rotina.",
  ],
  ["Interval must be >= 1", "O intervalo deve ser pelo menos 1."],
  ["Base date is required", "Informe a data base."],
  [
    "End date must be on or after base date",
    "A data final precisa ser igual ou posterior à data base.",
  ],
  ["Routine not found", "Rotina não encontrada."],
  [
    "Only OWNER can delete routines",
    "Apenas o Proprietário pode excluir rotinas.",
  ],
  ["Execution not found", "Execução não encontrada."],
  [
    "Only pending executions can be completed",
    "Só é possível concluir execuções pendentes.",
  ],
  [
    "Only pending executions can be cancelled",
    "Só é possível cancelar execuções pendentes.",
  ],
  [
    "Only pending executions can be rescheduled",
    "Só é possível reagendar execuções pendentes.",
  ],
  ["New due date is required", "Informe a nova data."],
  [
    "New due date must differ from the current due date",
    "A nova data precisa ser diferente da atual.",
  ],
  ["Not an active group member", "É necessário ser membro ativo do grupo."],
];

export function translateDomainError(message: string): string {
  for (const [needle, translation] of DOMAIN_ERROR_MAP) {
    if (typeof needle === "string") {
      if (message.includes(needle)) {
        return translation;
      }
    } else if (needle.test(message)) {
      return translation;
    }
  }

  return message;
}
