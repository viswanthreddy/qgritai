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
const allowedDocumentTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", "text/csv", "image/png", "image/jpeg",
]);

export async function createEngagement(formData: FormData) {
  const input = z.object({ name: titleSchema, description: z.string().trim().max(1000), startsOn: z.string().date().or(z.literal("")) }).safeParse(Object.fromEntries(formData));
  if (!input.success) dashboardError("Enter a valid engagement name and optional start date.");
  const context = await getWorkspace();
  if (!["owner", "admin", "consultant"].includes(context.role)) dashboardError("Your role cannot create engagements.");
  const { error } = await context.supabase.from("engagements").insert({ organization_id: context.organizationId, name: input.data.name, description: input.data.description || null, starts_on: input.data.startsOn || null, status: "planned", created_by: context.user.id });
  if (error) dashboardError(error.message);
  revalidatePath("/dashboard");
}

export async function updateEngagement(formData: FormData) {
  const input = z.object({
    id: z.string().uuid(), name: titleSchema, description: z.string().trim().max(1000),
    status: z.enum(["planned", "active", "on_hold", "complete", "cancelled"]),
    progress: z.coerce.number().int().min(0).max(100),
    startsOn: z.string().date().or(z.literal("")), endsOn: z.string().date().or(z.literal("")),
  }).refine(({ startsOn, endsOn }) => !startsOn || !endsOn || endsOn >= startsOn, { message: "End date must not precede start date." }).safeParse(Object.fromEntries(formData));
  if (!input.success) dashboardError(input.error.issues[0]?.message ?? "Enter valid engagement details.");
  const context = await getWorkspace();
  if (!["owner", "admin", "consultant"].includes(context.role)) dashboardError("Your role cannot edit engagements.");
  const { error } = await context.supabase.from("engagements").update({ name: input.data.name, description: input.data.description || null, status: input.data.status, progress: input.data.progress, starts_on: input.data.startsOn || null, ends_on: input.data.endsOn || null, updated_at: new Date().toISOString() }).eq("id", input.data.id).eq("organization_id", context.organizationId);
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

export async function updateAction(formData: FormData) {
  const input = z.object({ id: z.string().uuid(), title: titleSchema, engagementId: z.string().uuid().or(z.literal("")), dueOn: z.string().date().or(z.literal("")), status: z.enum(["open", "in_progress", "blocked", "complete"]) }).safeParse(Object.fromEntries(formData));
  if (!input.success) dashboardError("Enter valid action details.");
  const context = await getWorkspace();
  const { error } = await context.supabase.from("actions").update({ title: input.data.title, engagement_id: input.data.engagementId || null, due_on: input.data.dueOn || null, status: input.data.status, updated_at: new Date().toISOString() }).eq("id", input.data.id).eq("organization_id", context.organizationId);
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

export async function updateDecision(formData: FormData) {
  const input = z.object({ id: z.string().uuid(), title: titleSchema, rationale: z.string().trim().max(2000), engagementId: z.string().uuid().or(z.literal("")), status: z.enum(["proposed", "approved", "rejected", "superseded"]) }).safeParse(Object.fromEntries(formData));
  if (!input.success) dashboardError("Enter valid decision details.");
  const context = await getWorkspace();
  const decided = input.data.status === "approved" || input.data.status === "rejected";
  const { error } = await context.supabase.from("decisions").update({ title: input.data.title, rationale: input.data.rationale || null, engagement_id: input.data.engagementId || null, status: input.data.status, decided_by: decided ? context.user.id : null, decided_at: decided ? new Date().toISOString() : null }).eq("id", input.data.id).eq("organization_id", context.organizationId);
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

export async function uploadDocument(formData: FormData) {
  const engagementId = z.string().uuid().or(z.literal("")).safeParse(formData.get("engagementId"));
  const file = formData.get("file");
  if (!engagementId.success || !(file instanceof File) || file.size < 1 || file.size > 10 * 1024 * 1024 || !allowedDocumentTypes.has(file.type)) dashboardError("Choose an allowed document no larger than 10 MB.");
  const context = await getWorkspace();
  const safeName = file.name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-160) || "document";
  const storagePath = `${context.organizationId}/${crypto.randomUUID()}/${safeName}`;
  const { error: uploadError } = await context.supabase.storage.from("document-quarantine").upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) dashboardError("The document could not be uploaded.");
  const { error: metadataError } = await context.supabase.from("documents").insert({ organization_id: context.organizationId, engagement_id: engagementId.data || null, storage_path: storagePath, bucket_id: "document-quarantine", scan_status: "pending_scan", file_name: file.name.slice(0, 240), mime_type: file.type, size_bytes: file.size, created_by: context.user.id });
  if (metadataError) {
    await context.supabase.storage.from("document-quarantine").remove([storagePath]);
    dashboardError("The document metadata could not be saved.");
  }
  revalidatePath("/dashboard");
}

export async function downloadDocument(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) dashboardError("Invalid document request.");
  const context = await getWorkspace();
  const { data: document, error: documentError } = await context.supabase.from("documents").select("storage_path, file_name, bucket_id, scan_status").eq("id", id.data).eq("organization_id", context.organizationId).maybeSingle();
  if (documentError || !document) dashboardError("Document not found.");
  if (document.scan_status !== "clean" || document.bucket_id !== "client-documents") dashboardError("This document is not available until malware scanning passes.");
  const { data, error } = await context.supabase.storage.from(document.bucket_id).createSignedUrl(document.storage_path, 60, { download: document.file_name });
  if (error || !data?.signedUrl) dashboardError("The secure download link could not be created.");
  redirect(data.signedUrl);
}
