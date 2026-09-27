export function formatMemberRole(role: "OWNER" | "MEMBER"): string {
  return role === "OWNER" ? "Proprietário" : "Membro";
}

export function formatJoinedDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR");
}
