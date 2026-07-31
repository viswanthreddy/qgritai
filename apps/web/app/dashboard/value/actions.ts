"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function getReporter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("organization_members").select("organization_id, role").limit(1).maybeSingle();
  if (!membership) redirect("/onboarding");
  if (!["owner", "admin", "consultant"].includes(membership.role)) redirect("/dashboard/value?error=Your%20role%20cannot%20record%20reporting%20data.");
  return { supabase, user, organizationId: membership.organization_id };
}

function valueError(message: string): never { redirect(`/dashboard/value?error=${encodeURIComponent(message)}`); }
const optionalEngagement = z.string().uuid().or(z.literal(""));

export async function createValueMetric(formData: FormData) {
  const parsed = z.object({ name: z.string().trim().min(3).max(160), category: z.enum(["financial", "efficiency", "quality", "risk", "adoption"]), unit: z.string().trim().min(1).max(40), baseline: z.coerce.number().finite(), target: z.coerce.number().finite(), engagementId: optionalEngagement }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) valueError("Review the metric fields.");
  const context = await getReporter();
  const { error } = await context.supabase.from("value_metrics").insert({ organization_id: context.organizationId, engagement_id: parsed.data.engagementId || null, name: parsed.data.name, category: parsed.data.category, unit: parsed.data.unit, baseline_value: parsed.data.baseline, target_value: parsed.data.target, created_by: context.user.id });
  if (error) valueError("Unable to create the metric.");
  revalidatePath("/dashboard/value");
}

export async function recordValueMeasurement(formData: FormData) {
  const parsed = z.object({ metricId: z.string().uuid(), value: z.coerce.number().finite(), observedOn: z.string().date(), note: z.string().trim().max(1000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) valueError("Review the measurement fields.");
  const context = await getReporter();
  const { error } = await context.supabase.from("value_measurements").upsert({ metric_id: parsed.data.metricId, organization_id: context.organizationId, value: parsed.data.value, observed_on: parsed.data.observedOn, note: parsed.data.note || null, created_by: context.user.id }, { onConflict: "metric_id,observed_on" });
  if (error) valueError("Unable to record the measurement.");
  revalidatePath("/dashboard/value");
}

export async function recordAdoptionSnapshot(formData: FormData) {
  const parsed = z.object({ engagementId: optionalEngagement, observedOn: z.string().date(), eligibleUsers: z.coerce.number().int().positive(), activeUsers: z.coerce.number().int().nonnegative(), workflowsCompleted: z.coerce.number().int().nonnegative(), note: z.string().trim().max(1000) }).refine(data => data.activeUsers <= data.eligibleUsers, { message: "Active users cannot exceed eligible users." }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) valueError(parsed.error.issues[0]?.message ?? "Review the adoption fields.");
  const context = await getReporter();
  const { error } = await context.supabase.from("adoption_snapshots").insert({ organization_id: context.organizationId, engagement_id: parsed.data.engagementId || null, observed_on: parsed.data.observedOn, eligible_users: parsed.data.eligibleUsers, active_users: parsed.data.activeUsers, workflows_completed: parsed.data.workflowsCompleted, note: parsed.data.note || null, created_by: context.user.id });
  if (error) valueError("Unable to record the adoption snapshot.");
  revalidatePath("/dashboard/value");
}
