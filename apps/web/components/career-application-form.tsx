"use client";

import Script from "next/script";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { getResumeContentType, isAcceptedResume, MAX_RESUME_SIZE } from "@/lib/careers";
import { createClient } from "@/lib/supabase/client";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

type FieldErrors = Partial<Record<"fullName" | "email" | "phone" | "location" | "experience" | "noticePeriod" | "linkedInUrl" | "portfolioUrl" | "resume" | "coverNote" | "consent" | "captcha", string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+[1-9]\d{7,14}$/;

function isValidOptionalUrl(value: string) {
  if (!value) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}

function ErrorMessage({ id, message }: { id: string; message?: string }) {
  return message ? <span className="field-error" id={id} role="alert">{message}</span> : null;
}

export function CareerApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const [captchaToken, setCaptchaToken] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [failure, setFailure] = useState("");
  const [coverLength, setCoverLength] = useState(0);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderTurnstile = useCallback(() => {
    if (!siteKey || !window.turnstile || !captchaRef.current || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(captchaRef.current, {
      sitekey: siteKey,
      theme: "dark",
      action: "career_application",
      callback: (token: string) => { setCaptchaToken(token); setErrors(current => ({ ...current, captcha: undefined })); },
      "expired-callback": () => setCaptchaToken(""),
      "error-callback": () => setCaptchaToken(""),
    });
  }, [siteKey]);

  useEffect(() => {
    renderTurnstile();
    return () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = undefined;
    };
  }, [renderTurnstile]);

  function validate(formData: FormData) {
    const nextErrors: FieldErrors = {};
    const value = (name: string) => String(formData.get(name) ?? "").trim();
    const fullName = value("fullName");
    const email = value("email");
    const phone = value("phone");
    const location = value("location");
    const experience = Number(value("experience"));
    const linkedInUrl = value("linkedInUrl");
    const portfolioUrl = value("portfolioUrl");
    const coverNote = value("coverNote");
    const resume = formData.get("resume");

    if (fullName.length < 2) nextErrors.fullName = "Enter your full name.";
    if (!emailPattern.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!phonePattern.test(phone)) nextErrors.phone = "Use an international number such as +919876543210.";
    if (location.length < 2) nextErrors.location = "Enter your current city or location.";
    if (!Number.isFinite(experience) || experience < 0 || experience > 60) nextErrors.experience = "Enter your total experience in years.";
    if (!value("noticePeriod")) nextErrors.noticePeriod = "Select your notice period.";
    if (!isValidOptionalUrl(linkedInUrl)) nextErrors.linkedInUrl = "Enter a complete URL beginning with https://.";
    if (!isValidOptionalUrl(portfolioUrl)) nextErrors.portfolioUrl = "Enter a complete URL beginning with https://.";
    if (!(resume instanceof File) || !resume.size) nextErrors.resume = "Attach your resume.";
    else if (!isAcceptedResume(resume)) nextErrors.resume = "Use a PDF, DOC, or DOCX file whose content matches its extension.";
    else if (resume.size > MAX_RESUME_SIZE) nextErrors.resume = "The resume must be 5 MB or smaller.";
    if (coverNote.length > 1000) nextErrors.coverNote = "Keep the cover note within 1,000 characters.";
    if (!formData.get("consent")) nextErrors.consent = "Consent is required to submit your application.";
    if (!captchaToken) nextErrors.captcha = "Complete the CAPTCHA.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure("");
    setSubmitted(false);
    const formData = new FormData(event.currentTarget);
    formData.set("jobId", jobId);
    formData.set("turnstileToken", captchaToken);
    if (!validate(formData)) return;

    setSubmitting(true);
    try {
      const resume = formData.get("resume") as File;
      const resumeType = getResumeContentType(resume.name);
      if (!resumeType) throw new Error("Unsupported resume type.");
      const uploadResponse = await fetch("/api/careers/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: resume.name, fileType: resumeType, fileSize: resume.size, turnstileToken: captchaToken, companyWebsite: formData.get("companyWebsite") }),
      });
      const upload = await uploadResponse.json() as { path?: string; token?: string; applicationToken?: string; error?: string };
      if (!uploadResponse.ok || !upload.path || !upload.token || !upload.applicationToken) throw new Error(upload.error || "Resume upload could not start.");

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from("career-resumes").uploadToSignedUrl(upload.path, upload.token, resume, { contentType: resumeType });
      if (uploadError) throw new Error("Resume upload failed.");

      formData.delete("resume");
      formData.set("resumePath", upload.path);
      formData.set("resumeName", resume.name);
      formData.set("applicationToken", upload.applicationToken);
      const response = await fetch("/api/careers/apply", { method: "POST", body: formData });
      const result = await response.json() as { ok?: boolean; error?: string; fields?: FieldErrors };
      if (!response.ok || !result.ok) {
        if (result.fields) setErrors(result.fields);
        throw new Error(result.error || "Application could not be sent.");
      }
      formRef.current?.reset();
      setCoverLength(0);
      setCaptchaToken("");
      if (window.turnstile && widgetIdRef.current) window.turnstile.reset(widgetIdRef.current);
      setSubmitted(true);
      setErrors({});
    } catch {
      setFailure("We could not send your application right now. Please try again or email your resume to info@qgritai.com.");
    } finally {
      setSubmitting(false);
    }
  }

  return <>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={renderTurnstile}/>
    {submitted && <div className="application-success" role="status"><strong>Thank you for applying.</strong><p>We received your application for {jobTitle} and will be in touch if your experience matches the role.</p></div>}
    {failure && <div className="application-failure" role="alert">{failure}</div>}
    <form ref={formRef} className="career-form" onSubmit={submitApplication} noValidate>
      <input type="hidden" name="jobId" value={jobId}/>
      <label className="form-wide">Role<input value={jobTitle} readOnly aria-readonly="true"/></label>
      <label>Full name<span aria-hidden="true"> *</span><input name="fullName" required autoComplete="name" aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "fullName-error" : undefined}/><ErrorMessage id="fullName-error" message={errors.fullName}/></label>
      <label>Email<span aria-hidden="true"> *</span><input name="email" required type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined}/><ErrorMessage id="email-error" message={errors.email}/></label>
      <label>Phone with country code<span aria-hidden="true"> *</span><input name="phone" required type="tel" defaultValue="+91" autoComplete="tel" inputMode="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : "phone-help"}/><small id="phone-help">Example: +919876543210</small><ErrorMessage id="phone-error" message={errors.phone}/></label>
      <label>Current location / city<span aria-hidden="true"> *</span><input name="location" required autoComplete="address-level2" aria-invalid={Boolean(errors.location)} aria-describedby={errors.location ? "location-error" : undefined}/><ErrorMessage id="location-error" message={errors.location}/></label>
      <label>Total years of experience<span aria-hidden="true"> *</span><input name="experience" required type="number" min="0" max="60" step="0.5" inputMode="decimal" aria-invalid={Boolean(errors.experience)} aria-describedby={errors.experience ? "experience-error" : undefined}/><ErrorMessage id="experience-error" message={errors.experience}/></label>
      <label>Notice period<span aria-hidden="true"> *</span><select name="noticePeriod" required defaultValue=""><option value="" disabled>Select one</option><option>Immediate</option><option>15 days</option><option>30 days</option><option>60 days</option><option>90 days</option></select><ErrorMessage id="noticePeriod-error" message={errors.noticePeriod}/></label>
      <label>Current CTC<input name="currentCtc" maxLength={80} placeholder="Optional"/></label>
      <label>Expected CTC<input name="expectedCtc" maxLength={80} placeholder="Optional"/></label>
      <label>LinkedIn profile URL<input name="linkedInUrl" type="url" inputMode="url" placeholder="https://linkedin.com/in/..." aria-invalid={Boolean(errors.linkedInUrl)} aria-describedby={errors.linkedInUrl ? "linkedInUrl-error" : undefined}/><ErrorMessage id="linkedInUrl-error" message={errors.linkedInUrl}/></label>
      <label>Portfolio / GitHub URL<input name="portfolioUrl" type="url" inputMode="url" placeholder="https://github.com/..." aria-invalid={Boolean(errors.portfolioUrl)} aria-describedby={errors.portfolioUrl ? "portfolioUrl-error" : undefined}/><ErrorMessage id="portfolioUrl-error" message={errors.portfolioUrl}/></label>
      <label className="form-wide">Resume<span aria-hidden="true"> *</span><input name="resume" type="file" required accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-invalid={Boolean(errors.resume)} aria-describedby="resume-help resume-error"/><small id="resume-help">PDF, DOC, or DOCX · Maximum 5 MB</small><ErrorMessage id="resume-error" message={errors.resume}/></label>
      <label className="form-wide">Short cover note<textarea name="coverNote" rows={6} maxLength={1000} onChange={event => setCoverLength(event.target.value.length)} aria-invalid={Boolean(errors.coverNote)} aria-describedby="cover-count coverNote-error"/><small id="cover-count">{coverLength}/1,000 characters</small><ErrorMessage id="coverNote-error" message={errors.coverNote}/></label>
      <label className="form-trap" aria-hidden="true">Company website<input name="companyWebsite" tabIndex={-1} autoComplete="off"/></label>
      <label className="form-wide consent-field"><input name="consent" type="checkbox" required aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "consent-error" : undefined}/><span>I agree to QGRITAI storing and using my details for recruitment purposes.</span></label>
      <div className="form-wide"><ErrorMessage id="consent-error" message={errors.consent}/></div>
      <div className="form-wide captcha-field"><div ref={captchaRef}/>{!siteKey && <p className="field-error">Applications are temporarily unavailable because CAPTCHA is not configured.</p>}<ErrorMessage id="captcha-error" message={errors.captcha}/></div>
      <div className="form-wide form-submit"><button className="button" type="submit" disabled={submitting || !siteKey}>{submitting ? "Sending application…" : "Submit application"}</button><span>Or email <a href="mailto:info@qgritai.com">info@qgritai.com</a></span></div>
    </form>
  </>;
}
