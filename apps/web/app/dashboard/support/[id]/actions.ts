"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function getWorkspace() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("organization_members").select("organization_id, role").limit(1).maybeSingle();
  if (!membership) redirect("/onboarding");
  return { supabase, user, organizationId: membership.organization_id, role: membership.role };
}

function supportError(id: string, message: string): never {
  redirect(`/dashboard/support/${id}?error=${encodeURIComponent(message)}`);
}

export async function createSupportMessage(formData: FormData) {
  const parsed = z.object({ requestId: z.string().uuid(), body: z.string().trim().min(2).max(5000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/dashboard?error=Invalid%20support%20message.");
  const context = await getWorkspace();
  const { error } = await context.supabase.from("support_messages").insert({ support_request_id: parsed.data.requestId, organization_id: context.organizationId, body: parsed.data.body, created_by: context.user.id });
  if (error) supportError(parsed.data.requestId, "Unable to send the message.");
  revalidatePath(`/dashboard/support/${parsed.data.requestId}`);
  revalidatePath("/dashboard");
}

export async function updateSupportStatus(formData: FormData) {
  const parsed = z.object({ requestId: z.string().uuid(), status: z.enum(["open", "in_progress", "resolved", "closed"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/dashboard?error=Invalid%20support%20status.");
  const context = await getWorkspace();
  const { data: request } = await context.supabase.from("support_requests").select("created_by").eq("id", parsed.data.requestId).eq("organization_id", context.organizationId).maybeSingle();
  if (!request || (request.created_by !== context.user.id && !["owner", "admin", "consultant"].includes(context.role))) supportError(parsed.data.requestId, "You cannot update this request.");
  const { error } = await context.supabase.from("support_requests").update({ status: parsed.data.status, updated_at: new Date().toISOString() }).eq("id", parsed.data.requestId).eq("organization_id", context.organizationId);
  if (error) supportError(parsed.data.requestId, "Unable to update the request.");
  revalidatePath(`/dashboard/support/${parsed.data.requestId}`);
  revalidatePath("/dashboard");
}
