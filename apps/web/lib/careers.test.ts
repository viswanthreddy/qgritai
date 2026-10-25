import { describe, expect, it } from "vitest";
import { applicationSchema, isAcceptedResume, MAX_RESUME_SIZE } from "./careers";

const validApplication = {
  jobId: "ai-engineer",
  fullName: "Asha Rao",
  email: "asha@example.com",
  phone: "+919876543210",
  location: "Hyderabad",
  experience: "4",
  currentCtc: "",
  expectedCtc: "",
  noticePeriod: "30 days",
  linkedInUrl: "https://www.linkedin.com/in/asharao",
  portfolioUrl: "",
  coverNote: "",
  consent: "on",
  companyWebsite: "",
  turnstileToken: "verified-token",
};

describe("career application validation", () => {
  it("accepts a complete application", () => {
    expect(applicationSchema.safeParse(validApplication).success).toBe(true);
  });

  it("rejects invalid contact details and missing consent", () => {
    const result = applicationSchema.safeParse({ ...validApplication, email: "bad", phone: "98765", consent: "" });
    expect(result.success).toBe(false);
  });

  it("accepts only supported resume types", () => {
    expect(isAcceptedResume(new File(["resume"], "resume.pdf", { type: "application/pdf" }))).toBe(true);
    expect(isAcceptedResume(new File(["resume"], "resume.png", { type: "image/png" }))).toBe(false);
    expect(MAX_RESUME_SIZE).toBe(5_242_880);
  });
});
