"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/lib/actions/types";
import { translateDomainError } from "@/lib/errors/domain";
import { createClient } from "@/lib/supabase/server";
import {
  createInvitationSchema,
  invitationIdSchema,
} from "@/lib/validation/invitations";

export async function createInvitationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createInvitationSchema.safeParse({
    userGroupId: formData.get("userGroupId"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Você precisa estar autenticado" };
  }

  const { error } = await supabase.rpc("create_invitation", {
    p_user_group_id: parsed.data.userGroupId,
    p_email: parsed.data.email,
  });

  if (error) {
    return { error: translateDomainError(error.message) };
  }

  revalidatePath(`/groups/${parsed.data.userGroupId}`);
  revalidatePath("/groups");
  return { success: "Convite enviado." };
}

export async function acceptInvitationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = invitationIdSchema.safeParse({
    invitationId: formData.get("invitationId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Você precisa estar autenticado" };
  }

  const { data, error } = await supabase.rpc("accept_invitation", {
    p_invitation_id: parsed.data.invitationId,
  });

  if (error || !data) {
    return {
      error: translateDomainError(
        error?.message ?? "Não foi possível aceitar o convite",
      ),
    };
  }

  revalidatePath("/groups");
  redirect(`/groups/${data.user_group_id}`);
}

export async function cancelInvitationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = invitationIdSchema.safeParse({
    invitationId: formData.get("invitationId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const userGroupId = String(formData.get("userGroupId") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Você precisa estar autenticado" };
  }

  const { error } = await supabase.rpc("cancel_invitation", {
    p_invitation_id: parsed.data.invitationId,
  });

  if (error) {
    return { error: translateDomainError(error.message) };
  }

  revalidatePath("/groups");
  if (userGroupId) {
    revalidatePath(`/groups/${userGroupId}`);
  }

  return { success: "Convite cancelado." };
}
