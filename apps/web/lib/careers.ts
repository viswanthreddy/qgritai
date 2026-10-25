import { z } from "zod";

export const MAX_RESUME_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_RESUME_EXTENSIONS = ["pdf", "doc", "docx"] as const;
export const ACCEPTED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const applicationSchema = z.object({
  jobId: z.string().trim().min(1).max(120),
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(320),
  phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Use an international number such as +919876543210."),
  location: z.string().trim().min(2, "Enter your current city or location.").max(160),
  experience: z.coerce.number().min(0, "Experience cannot be negative.").max(60, "Enter a valid experience value."),
  currentCtc: z.string().trim().max(80),
  expectedCtc: z.string().trim().max(80),
  noticePeriod: z.enum(["Immediate", "15 days", "30 days", "60 days", "90 days"]),
  linkedInUrl: z.string().trim().url("Enter a valid LinkedIn URL.").max(500).or(z.literal("")),
  portfolioUrl: z.string().trim().url("Enter a valid portfolio or GitHub URL.").max(500).or(z.literal("")),
  coverNote: z.string().trim().max(1000, "Keep the cover note within 1,000 characters."),
  consent: z.literal("on", { error: "Consent is required." }),
  companyWebsite: z.string().max(0),
  turnstileToken: z.string().min(1, "Complete the CAPTCHA."),
});

export const applicationDetailsSchema = applicationSchema.omit({ turnstileToken: true });

export type ApplicationInput = z.infer<typeof applicationSchema>;

export function getResumeContentType(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return ACCEPTED_RESUME_TYPES[0];
  if (extension === "doc") return ACCEPTED_RESUME_TYPES[1];
  if (extension === "docx") return ACCEPTED_RESUME_TYPES[2];
  return null;
}

export function isAcceptedResume(file: File) {
  const expectedType = getResumeContentType(file.name);
  return Boolean(expectedType && (!file.type || file.type === expectedType));
}
