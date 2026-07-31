"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function getManager() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("organization_members").select("organization_id, role").limit(1).maybeSingle();
  if (!membership || !["owner", "admin"].includes(membership.role)) redirect("/dashboard");
  return { supabase, organizationId: membership.organization_id };
}

function memberError(message: string): never {
  redirect(`/dashboard/members?error=${encodeURIComponent(message)}`);
}

export async function updateMemberRole(formData: FormData) {
  const parsed = z.object({ userId: z.string().uuid(), role: z.enum(["owner", "admin", "consultant", "client"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) memberError("Invalid member role update.");
  const { supabase, organizationId } = await getManager();
  const { error } = await supabase.rpc("set_organization_member_role", { p_organization_id: organizationId, p_user_id: parsed.data.userId, p_next_role: parsed.data.role });
  if (error) memberError(error.message);
  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard");
}

export async function removeMember(formData: FormData) {
  const userId = z.string().uuid().safeParse(formData.get("userId"));
  if (!userId.success) memberError("Invalid member removal.");
  const { supabase, organizationId } = await getManager();
  const { error } = await supabase.rpc("remove_organization_member", { p_organization_id: organizationId, p_user_id: userId.data });
  if (error) memberError(error.message);
  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard");
}
