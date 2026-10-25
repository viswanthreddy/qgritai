import { NextResponse } from "next/server";
import { z } from "zod";
import { ACCEPTED_RESUME_EXTENSIONS, applicationDetailsSchema, MAX_RESUME_SIZE } from "@/lib/careers";
import { verifyCareerUploadToken } from "@/lib/career-upload-token";
import { getActiveJob } from "@/content/jobs";
import { getCareersEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const submissionSchema = applicationDetailsSchema.extend({
  resumePath: z.string().startsWith("applications/").max(500),
  resumeName: z.string().trim().min(1).max(255),
  applicationToken: z.string().min(20).max(2000),
});

function escapeHtml(value: string | number) {
  return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function cleanAttachmentName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  if (!ACCEPTED_RESUME_EXTENSIONS.includes(extension as (typeof ACCEPTED_RESUME_EXTENSIONS)[number])) return null;
  return name.replace(/[^a-zA-Z0-9._ -]+/g, "-").slice(0, 180);
}

function hasValidSignature(buffer: Buffer, extension: string) {
  if (extension === "pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  if (extension === "doc") return buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  if (extension === "docx") return buffer[0] === 0x50 && buffer[1] === 0x4b && [0x03, 0x05, 0x07].includes(buffer[2]) && [0x04, 0x06, 0x08].includes(buffer[3]);
  return false;
}

function emailContent(jobTitle: string, data: z.infer<typeof submissionSchema>, resumeName: string) {
  const values = [
    ["Role", jobTitle], ["Applicant", data.fullName], ["Email", data.email], ["Phone", data.phone],
    ["Current location", data.location], ["Total experience", `${data.experience} years`],
    ["Current CTC", data.currentCtc || "Not provided"], ["Expected CTC", data.expectedCtc || "Not provided"],
    ["Notice period", data.noticePeriod], ["LinkedIn", data.linkedInUrl || "Not provided"],
    ["Portfolio / GitHub", data.portfolioUrl || "Not provided"], ["Resume", resumeName],
    ["Cover note", data.coverNote || "Not provided"], ["Recruitment consent", "Agreed"],
  ];
  return {
    text: values.map(([label, value]) => `${label}: ${value}`).join("\n\n"),
    html: `<div style="font-family:Arial,sans-serif;max-width:680px;color:#142018"><h1 style="font-size:24px">New application: ${escapeHtml(jobTitle)}</h1><table style="width:100%;border-collapse:collapse">${values.map(([label, value]) => `<tr><th style="text-align:left;vertical-align:top;padding:10px;border-bottom:1px solid #dde7e0;width:180px">${escapeHtml(label)}</th><td style="padding:10px;border-bottom:1px solid #dde7e0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("")}</table></div>`,
  };
}

export async function POST(request: Request) {
  let env: ReturnType<typeof getCareersEnv>;
  try { env = getCareersEnv(); } catch { return NextResponse.json({ error: "Applications are temporarily unavailable." }, { status: 503 }); }

  let formData: FormData;
  try { formData = await request.formData(); } catch { return NextResponse.json({ error: "We could not read the application." }, { status: 400 }); }
  const parsed = submissionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map(issue => [String(issue.path[0]), issue.message]));
    return NextResponse.json({ error: "Review the highlighted fields and try again.", fields }, { status: 400 });
  }
  const data = parsed.data;
  const job = getActiveJob(data.jobId);
  if (!job) return NextResponse.json({ error: "This role is no longer accepting applications." }, { status: 404 });
  if (!verifyCareerUploadToken(data.applicationToken, data.resumePath, env.CAREERS_UPLOAD_SIGNING_SECRET)) return NextResponse.json({ error: "The resume upload expired. Please submit again." }, { status: 400 });
  const resumeName = cleanAttachmentName(data.resumeName);
  if (!resumeName) return NextResponse.json({ error: "Use a PDF, DOC, or DOCX resume." }, { status: 400 });

  const admin = createAdminClient(env.SUPABASE_SERVICE_ROLE_KEY);
  try {
    const { data: resumeBlob, error: downloadError } = await admin.storage.from("career-resumes").download(data.resumePath);
    if (downloadError || !resumeBlob) throw new Error("Resume could not be retrieved.");
    const buffer = Buffer.from(await resumeBlob.arrayBuffer());
    if (!buffer.length || buffer.length > MAX_RESUME_SIZE) return NextResponse.json({ error: "The resume must be 5 MB or smaller." }, { status: 400 });
    const extension = resumeName.split(".").pop()?.toLowerCase() ?? "";
    if (!hasValidSignature(buffer, extension)) return NextResponse.json({ error: "The resume content does not match its file type." }, { status: 400 });

    const content = emailContent(job.title, data, resumeName);
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [env.CAREERS_NOTIFICATION_TO],
        reply_to: data.email,
        subject: `New Application: ${job.title} – ${data.fullName}`,
        text: content.text,
        html: content.html,
        attachments: [{ filename: resumeName, content: buffer.toString("base64") }],
      }),
    });
    if (!emailResponse.ok) throw new Error(`Email provider returned ${emailResponse.status}.`);

    // Confirmation is best-effort: the application remains successful if this second email fails.
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [data.email],
        subject: `We've received your application for ${job.title}`,
        text: `Hi ${data.fullName},\n\nThank you for applying for the ${job.title} role at QGRITAI. We have received your application and will contact you if your experience matches the role.\n\nQGRITAI\nQuantum ambition. Grit-driven execution. AI-powered transformation.`,
      }),
    }).catch(() => undefined);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We could not send your application. Please try again or email info@qgritai.com." }, { status: 502 });
  } finally {
    await admin.storage.from("career-resumes").remove([data.resumePath]);
  }
}
