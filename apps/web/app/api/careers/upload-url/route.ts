import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ACCEPTED_RESUME_EXTENSIONS, ACCEPTED_RESUME_TYPES, getResumeContentType, MAX_RESUME_SIZE } from "@/lib/careers";
import { createCareerUploadToken } from "@/lib/career-upload-token";
import { getCareersEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileType: z.enum(ACCEPTED_RESUME_TYPES),
  fileSize: z.number().int().positive().max(MAX_RESUME_SIZE),
  turnstileToken: z.string().min(1).max(4096),
  companyWebsite: z.string().max(0),
});

function safeFileName(name: string) {
  const parts = name.split(".");
  const extension = parts.pop()?.toLowerCase() ?? "";
  if (!ACCEPTED_RESUME_EXTENSIONS.includes(extension as (typeof ACCEPTED_RESUME_EXTENSIONS)[number])) return null;
  const stem = parts.join(".").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "resume";
  return `${stem}.${extension}`;
}

export async function POST(request: Request) {
  let env: ReturnType<typeof getCareersEnv>;
  try { env = getCareersEnv(); } catch { return NextResponse.json({ error: "Applications are temporarily unavailable." }, { status: 503 }); }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Review the resume and CAPTCHA, then try again." }, { status: 400 }); }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Use a PDF, DOC, or DOCX resume no larger than 5 MB." }, { status: 400 });
  const fileName = safeFileName(parsed.data.fileName);
  if (!fileName) return NextResponse.json({ error: "Use a PDF, DOC, or DOCX resume." }, { status: 400 });
  if (getResumeContentType(fileName) !== parsed.data.fileType) return NextResponse.json({ error: "The resume type does not match its extension." }, { status: 400 });

  const verificationBody = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: parsed.data.turnstileToken });
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwardedFor) verificationBody.set("remoteip", forwardedFor);
  const verificationResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: verificationBody, cache: "no-store" });
  const verification = await verificationResponse.json() as { success?: boolean; action?: string };
  if (!verification.success || (verification.action && verification.action !== "career_application")) {
    return NextResponse.json({ error: "CAPTCHA verification failed. Please refresh and try again." }, { status: 400 });
  }

  const date = new Date().toISOString().slice(0, 10);
  const path = `applications/${date}/${randomUUID()}-${fileName}`;
  const admin = createAdminClient(env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await admin.storage.from("career-resumes").createSignedUploadUrl(path);
  if (error || !data?.token) return NextResponse.json({ error: "Resume upload could not start. Please try again." }, { status: 500 });
  return NextResponse.json({ path, token: data.token, applicationToken: createCareerUploadToken(path, env.CAREERS_UPLOAD_SIGNING_SECRET) });
}
