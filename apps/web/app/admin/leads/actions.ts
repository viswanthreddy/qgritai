"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function updateLeadStatus(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["new", "qualified", "discovery", "proposal", "won", "lost"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/leads?error=Invalid%20lead%20update.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("platform_role").eq("id", user.id).single();
  if (!profile || !["consultant", "admin"].includes(profile.platform_role)) redirect("/dashboard");
  const { error } = await supabase.from("leads").update({ status: parsed.data.status, updated_at: new Date().toISOString() }).eq("id", parsed.data.id);
  if (error) redirect("/admin/leads?error=Unable%20to%20update%20the%20lead.");
  revalidatePath("/admin/leads");
}
