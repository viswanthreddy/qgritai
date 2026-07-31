"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function getStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("platform_role").eq("id", user.id).single();
  if (!profile || !["consultant", "admin"].includes(profile.platform_role)) redirect("/dashboard");
  return { supabase, user };
}

function opportunityError(leadId: string, message: string): never {
  redirect(`/admin/leads/${leadId}?error=${encodeURIComponent(message)}`);
}

export async function createDiscoveryNote(formData: FormData) {
  const parsed = z.object({ leadId: z.string().uuid(), body: z.string().trim().min(10).max(5000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/leads?error=Invalid%20discovery%20note.");
  const { supabase, user } = await getStaff();
  const { error } = await supabase.from("discovery_notes").insert({ lead_id: parsed.data.leadId, body: parsed.data.body, created_by: user.id });
  if (error) opportunityError(parsed.data.leadId, "Unable to save the discovery note.");
  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
}

export async function createProposal(formData: FormData) {
  const parsed = z.object({ leadId: z.string().uuid(), title: z.string().trim().min(3).max(160), summary: z.string().trim().min(20).max(5000), feeAmount: z.string().refine(value => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0)), currency: z.string().regex(/^[A-Z]{3}$/) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/leads?error=Invalid%20proposal.");
  const { supabase, user } = await getStaff();
  const { error } = await supabase.from("proposals").insert({ lead_id: parsed.data.leadId, title: parsed.data.title, summary: parsed.data.summary, fee_amount: parsed.data.feeAmount === "" ? null : Number(parsed.data.feeAmount), currency: parsed.data.currency, created_by: user.id });
  if (error) opportunityError(parsed.data.leadId, "Unable to create the proposal.");
  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
}

export async function updateProposalStatus(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), leadId: z.string().uuid(), status: z.enum(["draft", "sent", "accepted", "declined"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/leads?error=Invalid%20proposal%20update.");
  const { supabase } = await getStaff();
  const { error } = await supabase.rpc("set_proposal_status", { target_proposal_id: parsed.data.id, target_lead_id: parsed.data.leadId, next_status: parsed.data.status });
  if (error) opportunityError(parsed.data.leadId, "Unable to update the proposal.");
  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
  revalidatePath("/admin/leads");
}
