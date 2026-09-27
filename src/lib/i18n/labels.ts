export function formatMemberRole(role: "OWNER" | "MEMBER"): string {
  return role === "OWNER" ? "Proprietário" : "Membro";
}

export function formatJoinedDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function formatInvitationStatus(
  status: "PENDING" | "ACCEPTED" | "CANCELLED" | "EXPIRED",
): string {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "ACCEPTED":
      return "Aceito";
    case "CANCELLED":
      return "Cancelado";
    case "EXPIRED":
      return "Expirado";
  }
}
