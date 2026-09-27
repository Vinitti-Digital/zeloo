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

export type ActivityEntityType =
  | "USER_GROUP"
  | "MEMBERSHIP"
  | "INVITATION"
  | "MAINTENANCE_GROUP"
  | "SERVICE"
  | "ROUTINE"
  | "EXECUTION";

export type ActivityAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "COMPLETED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "INVITED"
  | "INVITE_ACCEPTED"
  | "INVITE_CANCELLED"
  | "INVITE_RESENT"
  | "MEMBER_LEFT"
  | "MEMBER_REMOVED"
  | "OWNER_SUCCEEDED"
  | "ROUTINE_RECALCULATED";

export function formatActivityEntityType(type: ActivityEntityType): string {
  switch (type) {
    case "USER_GROUP":
      return "Grupo";
    case "MEMBERSHIP":
      return "Membros";
    case "INVITATION":
      return "Convite";
    case "MAINTENANCE_GROUP":
      return "Manutenção";
    case "SERVICE":
      return "Serviço";
    case "ROUTINE":
      return "Rotina";
    case "EXECUTION":
      return "Execução";
  }
}

export function formatActivityAction(action: ActivityAction): string {
  switch (action) {
    case "CREATED":
      return "criou";
    case "UPDATED":
      return "atualizou";
    case "DELETED":
      return "excluiu";
    case "COMPLETED":
      return "concluiu";
    case "RESCHEDULED":
      return "reagendou";
    case "CANCELLED":
      return "cancelou";
    case "INVITED":
      return "convidou";
    case "INVITE_ACCEPTED":
      return "aceitou o convite";
    case "INVITE_CANCELLED":
      return "cancelou o convite";
    case "INVITE_RESENT":
      return "reenviou o convite";
    case "MEMBER_LEFT":
      return "saiu do grupo";
    case "MEMBER_REMOVED":
      return "removeu um membro";
    case "OWNER_SUCCEEDED":
      return "transferiu a propriedade";
    case "ROUTINE_RECALCULATED":
      return "recalculou a rotina";
  }
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatActivitySubject(
  entityType: ActivityEntityType,
  metadata: Record<string, unknown> | null,
): string | null {
  if (!metadata) return null;
  const title = metadata.title;
  const name = metadata.name;
  const email = metadata.email;
  if (typeof title === "string" && title.trim()) return title;
  if (typeof name === "string" && name.trim()) return name;
  if (typeof email === "string" && email.trim()) return email;
  if (entityType === "ROUTINE" && typeof metadata.created_executions === "number") {
    return `${metadata.created_executions} execução(ões)`;
  }
  return null;
}
