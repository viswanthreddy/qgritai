# Careers setup and operations

The Careers feature uses the existing Next.js application and Vercel server functions. Cloudflare Turnstile blocks automated submissions, Supabase Storage holds each resume privately while the application is processed, and Resend emails the application and resume attachment to `info@qgritai.com`.

Resumes are uploaded directly to a private storage bucket so the advertised 5 MB limit does not conflict with Vercel's smaller function request-body limit. The application endpoint downloads the resume, verifies its extension, size, and file signature, attaches it to the email, and deletes the temporary copy.

## One-time production setup

### 1. Create the private resume bucket

From the repository folder, apply the included Supabase migration:

```bash
pnpm exec supabase link --project-ref YOUR_PROJECT_REFERENCE
pnpm exec supabase db push --dry-run
pnpm exec supabase db push
```

The migration creates a private `career-resumes` bucket. Do not make this bucket public and do not add public read policies.

### 2. Create the CAPTCHA

1. Sign in to Cloudflare and open **Turnstile**.
2. Choose **Add widget** and name it `QGRITAI Careers`.
3. Add `qgritai.com` as an allowed hostname. Add `localhost` while testing locally.
4. Choose the managed widget mode and create the widget.
5. Copy the **Site key** and **Secret key** separately.

The site key is safe for the browser. The secret key must remain server-only.

### 3. Confirm email delivery

The feature reuses the existing Resend account and verified QGRITAI sending domain. In Resend:

1. Confirm the sending domain still shows **Verified**.
2. Confirm `EMAIL_FROM` uses an address on that domain, for example `QGRITAI Careers <careers@qgritai.com>`.
3. No form-service subscription is required. Resumes are sent through the Resend API as email attachments; normal Resend account sending limits still apply.

### 4. Add Vercel environment variables

Open **Vercel → qgritai → Settings → Environment Variables** and add these values to Production. Add them to Preview only if previews should use a safe non-production Supabase project.

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site key copied from Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | Secret key copied from Cloudflare Turnstile |
| `CAREERS_NOTIFICATION_TO` | `info@qgritai.com` |
| `CAREERS_UPLOAD_SIGNING_SECRET` | A new long random value |
| `SUPABASE_SERVICE_ROLE_KEY` | Existing server-only Supabase service-role key |
| `RESEND_API_KEY` | Existing server-only Resend API key |
| `EMAIL_FROM` | Sender on the verified QGRITAI domain |

Create the signing secret on your computer with:

```bash
openssl rand -base64 48
```

Copy the result into Vercel. Never paste it into source code or commit it to GitHub. After saving the variables, redeploy the latest production deployment so the new values are loaded.

## Adding or removing a job

All postings live in one file: `apps/web/content/jobs.ts`. Copy an existing object inside the `jobs` array and change its fields:

```ts
{
  id: "ai-product-manager",
  title: "AI Product Manager",
  department: "Product",
  location: "Hyderabad / Hybrid",
  employmentType: "full-time",
  experience: "4+ years",
  summary: "Lead practical AI products from discovery through measurable adoption.",
  description: ["A full paragraph describing the opportunity."],
  responsibilities: ["Own product discovery and delivery."],
  requirements: ["Experience shipping B2B software."],
  niceToHaves: ["Experience with AI agents or workflow automation."],
  postedDate: "2026-10-25",
  active: true,
}
```

Use a unique lowercase `id` with hyphens. Set `active: false` to hide a role without deleting it. Only active jobs appear on the Careers page and can accept applications.

## Testing checklist

- Open `/careers` on desktop and mobile. Confirm the navigation, footer, two job cards, and page spacing match the rest of the website.
- Open each role and verify its full description, responsibilities, requirements, nice-to-haves, and Apply button.
- Submit a test application with a small PDF resume. Confirm the loading state, success message, and applicant confirmation email.
- Confirm `info@qgritai.com` receives an email titled `New Application: [Job Title] – [Applicant Name]`.
- Open the received email and confirm every form field is readable, the resume is a real attachment, and Reply targets the applicant's email address.
- Try an image or text file and confirm the form rejects it.
- Try a PDF, DOC, or DOCX larger than 5 MB and confirm the size error appears.
- Leave each required field blank once and confirm the inline message is associated with that field.
- Enter invalid email, phone, LinkedIn, and portfolio values and confirm they are rejected.
- Confirm the consent checkbox and CAPTCHA are required.
- Test at approximately 375 px wide and verify there is no horizontal scrolling and all controls are keyboard accessible.
- Review Vercel function logs and Supabase Storage after a successful submission. The processed resume should no longer be present in `career-resumes`.

## Files in this feature

- `apps/web/content/jobs.ts` — the single job-posting data source.
- `apps/web/app/careers/page.tsx` — Careers landing page and empty state.
- `apps/web/app/careers/[id]/page.tsx` — job detail page.
- `apps/web/app/careers/[id]/apply/page.tsx` — application page.
- `apps/web/components/career-application-form.tsx` — accessible client-side form and validation.
- `apps/web/app/api/careers/upload-url/route.ts` — CAPTCHA verification and private signed upload creation.
- `apps/web/app/api/careers/apply/route.ts` — server validation, email delivery, confirmation, and cleanup.
- `apps/web/lib/careers.ts` — shared validation rules.
- `apps/web/lib/career-upload-token.ts` — short-lived signed upload authorization.
- `supabase/migrations/20261025090000_career_resume_uploads.sql` — private resume bucket.
