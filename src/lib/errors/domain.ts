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
