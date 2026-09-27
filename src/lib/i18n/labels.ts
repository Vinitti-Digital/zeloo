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

export function formatServicePriority(
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null | undefined,
): string {
  switch (priority) {
    case "LOW":
      return "Baixa";
    case "MEDIUM":
      return "Média";
    case "HIGH":
      return "Alta";
    case "URGENT":
      return "Urgente";
    default:
      return "Sem prioridade";
  }
}

export function formatServiceStatus(status: "ACTIVE" | "COMPLETED"): string {
  return status === "ACTIVE" ? "Ativo" : "Concluído";
}

export function formatRoutineFrequency(
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
): string {
  switch (frequency) {
    case "DAILY":
      return "Diária";
    case "WEEKLY":
      return "Semanal";
    case "MONTHLY":
      return "Mensal";
    case "YEARLY":
      return "Anual";
  }
}

export function formatExecutionStatus(
  status: "PENDING" | "COMPLETED" | "CANCELLED",
): string {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "COMPLETED":
      return "Concluída";
    case "CANCELLED":
      return "Cancelada";
  }
}

export function formatDateOnly(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
}
