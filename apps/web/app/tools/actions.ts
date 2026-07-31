"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { calculateReadiness, calculateRoi, readinessDimensions } from "@/lib/calculations";
import { createClient } from "@/lib/supabase/server";

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("organization_members").select("organization_id").limit(1).maybeSingle();
  if (!membership) redirect("/onboarding");
  return { supabase, user, organizationId: membership.organization_id };
}

export async function saveReadiness(formData: FormData) {
  const scores = readinessDimensions.map(dimension => Number(formData.get(dimension)));
  const result = calculateReadiness(scores);
  const { supabase, user, organizationId } = await getContext();
  const { data: assessment, error } = await supabase.from("assessments").insert({ organization_id: organizationId, created_by: user.id, total_score: result.total, result_label: result.label }).select("id").single();
  if (error) redirect(`/readiness?error=${encodeURIComponent(error.message)}`);
  const responses = readinessDimensions.map((dimension, index) => ({ assessment_id: assessment.id, organization_id: organizationId, dimension, score: scores[index] }));
  const { error: responseError } = await supabase.from("assessment_responses").insert(responses);
  if (responseError) redirect(`/readiness?error=${encodeURIComponent(responseError.message)}`);
  redirect("/readiness?saved=true");
}

const readinessLeadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  workEmail: z.string().trim().email().max(320),
  company: z.string().trim().min(2).max(160),
  jobTitle: z.string().trim().max(160),
  message: z.string().trim().min(20).max(3000),
  website: z.string().max(0),
});

export async function submitReadinessLead(formData: FormData) {
  const parsed = readinessLeadSchema.safeParse(Object.fromEntries(formData));
  const scores = readinessDimensions.map(dimension => Number(formData.get(dimension)));
  if (!parsed.success || scores.some(score => !Number.isInteger(score) || score < 1 || score > 5)) {
    redirect("/readiness?error=Please%20review%20the%20required%20fields.");
  }
  const result = calculateReadiness(scores);
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_readiness_lead", {
    full_name: parsed.data.fullName,
    work_email: parsed.data.workEmail,
    company: parsed.data.company,
    job_title: parsed.data.jobTitle,
    message: parsed.data.message,
    readiness_score: result.total,
    readiness_label: result.label,
  });
  if (error) redirect("/readiness?error=We%20could%20not%20submit%20your%20request.%20Please%20try%20again.");
  redirect("/readiness/received");
}

const roiSchema = z.object({
  people: z.coerce.number().int().positive(),
  weeklyHours: z.coerce.number().nonnegative(),
  hourlyCost: z.coerce.number().nonnegative(),
  automationPercent: z.coerce.number().min(0).max(100),
  implementationCost: z.coerce.number().nonnegative(),
});

export async function saveRoiScenario(formData: FormData) {
  const parsed = roiSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/roi?error=Review%20the%20scenario%20inputs.");
  const result = calculateRoi(parsed.data);
  const { supabase, user, organizationId } = await getContext();
  const { error } = await supabase.from("roi_scenarios").insert({
    organization_id: organizationId, created_by: user.id, name: "Automation opportunity",
    people: parsed.data.people, weekly_hours: parsed.data.weeklyHours, hourly_cost: parsed.data.hourlyCost,
    automation_percent: parsed.data.automationPercent, implementation_cost: parsed.data.implementationCost,
    annual_hours: result.annualHours, annual_value: result.annualValue, roi_percent: result.roi, payback_months: result.payback,
  });
  if (error) redirect(`/roi?error=${encodeURIComponent(error.message)}`);
  redirect("/roi?saved=true");
}
