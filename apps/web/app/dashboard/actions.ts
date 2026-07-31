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

function dashboardError(message: string): never {
  redirect(`/dashboard?error=${encodeURIComponent(message)}`);
}

const titleSchema = z.string().trim().min(3).max(160);

export async function createEngagement(formData: FormData) {
  const input = z.object({ name: titleSchema, description: z.string().trim().max(1000), startsOn: z.string().date().or(z.literal("")) }).safeParse(Object.fromEntries(formData));
  if (!input.success) dashboardError("Enter a valid engagement name and optional start date.");
  const context = await getWorkspace();
  if (!["owner", "admin", "consultant"].includes(context.role)) dashboardError("Your role cannot create engagements.");
  const { error } = await context.supabase.from("engagements").insert({ organization_id: context.organizationId, name: input.data.name, description: input.data.description || null, starts_on: input.data.startsOn || null, status: "planned", created_by: context.user.id });
  if (error) dashboardError(error.message);
  revalidatePath("/dashboard");
}

export async function createAction(formData: FormData) {
  const input = z.object({ title: titleSchema, engagementId: z.string().uuid().or(z.literal("")), dueOn: z.string().date().or(z.literal("")) }).safeParse(Object.fromEntries(formData));
  if (!input.success) dashboardError("Enter a valid action title and optional due date.");
  const context = await getWorkspace();
  const { error } = await context.supabase.from("actions").insert({ organization_id: context.organizationId, engagement_id: input.data.engagementId || null, title: input.data.title, due_on: input.data.dueOn || null, created_by: context.user.id });
  if (error) dashboardError(error.message);
  revalidatePath("/dashboard");
}

export async function updateActionStatus(formData: FormData) {
  const input = z.object({ id: z.string().uuid(), status: z.enum(["open", "in_progress", "blocked", "complete"]) }).safeParse(Object.fromEntries(formData));
  if (!input.success) dashboardError("Invalid action update.");
  const context = await getWorkspace();
  const { error } = await context.supabase.from("actions").update({ status: input.data.status, updated_at: new Date().toISOString() }).eq("id", input.data.id).eq("created_by", context.user.id);
  if (error) dashboardError(error.message);
  revalidatePath("/dashboard");
}

export async function createDecision(formData: FormData) {
  const input = z.object({ title: titleSchema, rationale: z.string().trim().max(2000), engagementId: z.string().uuid().or(z.literal("")) }).safeParse(Object.fromEntries(formData));
  if (!input.success) dashboardError("Enter a valid decision title and rationale.");
  const context = await getWorkspace();
  const { error } = await context.supabase.from("decisions").insert({ organization_id: context.organizationId, engagement_id: input.data.engagementId || null, title: input.data.title, rationale: input.data.rationale || null, created_by: context.user.id });
  if (error) dashboardError(error.message);
  revalidatePath("/dashboard");
}

export async function updateDecisionStatus(formData: FormData) {
  const input = z.object({ id: z.string().uuid(), status: z.enum(["proposed", "approved", "rejected", "superseded"]) }).safeParse(Object.fromEntries(formData));
  if (!input.success) dashboardError("Invalid decision update.");
  const context = await getWorkspace();
  const decided = input.data.status === "approved" || input.data.status === "rejected";
  const { error } = await context.supabase.from("decisions").update({ status: input.data.status, decided_by: decided ? context.user.id : null, decided_at: decided ? new Date().toISOString() : null }).eq("id", input.data.id).eq("created_by", context.user.id);
  if (error) dashboardError(error.message);
  revalidatePath("/dashboard");
}

export async function createSupportRequest(formData: FormData) {
  const input = z.object({ subject: titleSchema, description: z.string().trim().min(10).max(3000), engagementId: z.string().uuid().or(z.literal("")) }).safeParse(Object.fromEntries(formData));
  if (!input.success) dashboardError("Provide a subject and at least 10 characters of detail.");
  const context = await getWorkspace();
  const { error } = await context.supabase.from("support_requests").insert({ organization_id: context.organizationId, engagement_id: input.data.engagementId || null, subject: input.data.subject, description: input.data.description, created_by: context.user.id });
  if (error) dashboardError(error.message);
  revalidatePath("/dashboard");
}
